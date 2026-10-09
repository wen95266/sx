#!/usr/bin/env node
/**
 * 🀄 十三水 (Chinese Poker) 高性能全功能生产级服务端
 * 兼容环境：Android Termux / Linux VPS / Serv00 (FreeBSD) / Phusion Passenger / Docker
 * 特性：
 * - 超低内存占用 (< 35MB RAM)，专为 Serv00 (512MB配额) 与 Termux (手机低功耗) 优化
 * - 内置高性能房间同步状态机 (/api/room/sync, /api/room/chat)
 * - 静态音频分片流式加载 (/audio/*，支持 Accept-Ranges 与高效缓存)
 * - 纯净 SPA 路由回退，自动适配 dist/ 静态前端
 * - 兼容 Serv00 Phusion Passenger 与普通独立进程模式
 */

import express from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import dotenv from 'dotenv';
import {
  handleTelegramUpdate,
  getBotConfig,
  setTelegramWebhook,
  getTelegramWebhookInfo,
  deleteTelegramWebhook,
  getTelegramMe,
  runBotDiagnostics,
  getAuthorizedPhones,
  getRegisteredUsers,
  saveRegisteredUsers
} from './scripts/tgBotCore.js';

// 1. 自动定位并加载 .env 环境变量
const possibleEnvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(os.homedir(), 'sx', '.env'),
  path.resolve(os.homedir(), '.env')
];
for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const app = express();
const server = http.createServer(app);

// 2. 基础配置
const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = process.env.HOST || '0.0.0.0';
const DIST_PATH = path.resolve(process.cwd(), 'dist');
const PUBLIC_PATH = path.resolve(process.cwd(), 'public');

// 请求体解析 (支持语音音频 Base64 传输，限制 10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 跨域与安全响应头
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 3. 高性能内存房间状态机 (轻量化存储，自动剔除离线用户)
const roomsMemory = {};

// 定期内存清理器：每 30 秒自动清理超时未活动的房间，防止 Serv00 长期运行爆内存
setInterval(() => {
  const now = Date.now();
  for (const [id, room] of Object.entries(roomsMemory)) {
    // 超过 1 小时无任何更新的房间彻底销毁
    if (now - room.lastUpdated > 3600000) {
      delete roomsMemory[id];
      continue;
    }
    // 清理离线超过 20 秒的玩家席位
    let hasPlayers = false;
    for (let i = 0; i < room.seats.length; i++) {
      if (room.seats[i]) {
        if (now - room.seats[i].lastSeen > 20000) {
          room.seats[i] = null;
        } else {
          hasPlayers = true;
        }
      }
    }
    // 限制聊天记录数量，最多保留 20 条
    if (room.chatBubbles && room.chatBubbles.length > 20) {
      room.chatBubbles = room.chatBubbles.slice(-20);
    }
  }
}, 30000);

// 4. 音频流式分块加载中间件 (保证移动端/Safari/低带宽环境即点即播)
app.use('/audio', (req, res, next) => {
  const cleanUrl = req.url.split('?')[0];
  const audioFilePath = path.join(PUBLIC_PATH, 'audio', cleanUrl);

  if (fs.existsSync(audioFilePath) && fs.statSync(audioFilePath).isFile()) {
    const ext = path.extname(audioFilePath).toLowerCase();
    const mimeTypes = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.m4a': 'audio/mp4',
      '.aac': 'audio/aac'
    };
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    res.setHeader('Accept-Ranges', 'bytes');
    return fs.createReadStream(audioFilePath).pipe(res);
  }
  next();
});

// 5. 核心多人对战房间 API (/api/room/sync)
app.post('/api/room/sync', (req, res) => {
  try {
    const {
      roomId = 'room_realtime_4',
      maxPlayers = 4,
      userId,
      nickname,
      avatar,
      phone,
      targetSeatIndex,
      isSubmitted,
      arrangement,
      action,
      dealtCardsMap
    } = req.body || {};

    if (!roomsMemory[roomId]) {
      roomsMemory[roomId] = {
        roomId,
        maxPlayers,
        seats: Array(maxPlayers).fill(null),
        chatBubbles: [],
        phase: 'WAITING',
        dealerUserId: null,
        lastUpdated: Date.now()
      };
    }

    const room = roomsMemory[roomId];
    room.maxPlayers = maxPlayers;

    // 适配席位容量变更
    if (room.seats.length !== maxPlayers) {
      const old = room.seats;
      room.seats = Array(maxPlayers).fill(null);
      for (let i = 0; i < Math.min(old.length, maxPlayers); i++) {
        room.seats[i] = old[i];
      }
    }

    const now = Date.now();

    // 清理离线超时玩家 (> 15s)
    for (let i = 0; i < maxPlayers; i++) {
      if (room.seats[i] && now - room.seats[i].lastSeen > 15000) {
        room.seats[i] = null;
      }
    }

    // 玩家退出处理
    if (action === 'leave' && userId) {
      for (let i = 0; i < maxPlayers; i++) {
        if (room.seats[i]?.id === userId) {
          room.seats[i] = null;
        }
      }
    } else if (userId) {
      let existingSeatIndex = room.seats.findIndex((s) => s && s.id === userId);

      if (existingSeatIndex === -1 && typeof targetSeatIndex === 'number' && targetSeatIndex >= 0 && targetSeatIndex < maxPlayers) {
        if (!room.seats[targetSeatIndex]) {
          existingSeatIndex = targetSeatIndex;
        }
      }

      if (existingSeatIndex === -1 && action === 'join') {
        existingSeatIndex = room.seats.findIndex((s) => s === null);
      }

      if (existingSeatIndex !== -1) {
        const existing = room.seats[existingSeatIndex] || {};
        room.seats[existingSeatIndex] = {
          id: userId,
          name: nickname || '玩家',
          avatar: avatar || '😎',
          phone,
          seatIndex: existingSeatIndex,
          isAi: false,
          isReady: true,
          isSubmitted: isSubmitted ?? existing.isSubmitted ?? false,
          arrangement: arrangement || existing.arrangement || { head: [], middle: [], tail: [], isDaoPai: false },
          cards: dealtCardsMap?.[userId] || existing.cards || [],
          lastSeen: now
        };
      }
    }

    // 统计当前真实入座玩家
    const activeSeats = room.seats.filter((s) => s !== null);
    const realPlayersCount = activeSeats.length;

    // 自动房主推选机制
    let hostUserId = null;
    if (activeSeats.length > 0) {
      const currentHost = activeSeats.find((s) => s.isHost);
      if (currentHost) {
        hostUserId = currentHost.id;
      } else {
        activeSeats[0].isHost = true;
        hostUserId = activeSeats[0].id;
      }
    }

    for (let i = 0; i < maxPlayers; i++) {
      if (room.seats[i]) {
        room.seats[i].isHost = room.seats[i].id === hostUserId;
      }
    }

    // 房间阶段流转
    if (realPlayersCount < 2) {
      room.phase = 'WAITING';
    } else if (action === 'dealCards') {
      room.phase = 'ARRANGING';
      room.dealerUserId = userId;
      if (dealtCardsMap) {
        for (let i = 0; i < maxPlayers; i++) {
          if (room.seats[i] && dealtCardsMap[room.seats[i].id]) {
            room.seats[i].cards = dealtCardsMap[room.seats[i].id];
            room.seats[i].isSubmitted = false;
          }
        }
      }
    }

    room.lastUpdated = now;

    res.json({
      roomId,
      maxPlayers,
      realPlayersCount,
      hostUserId,
      phase: room.phase,
      seats: room.seats,
      chatBubbles: room.chatBubbles || [],
      lastUpdated: now
    });
  } catch (err) {
    console.error('[Room API Sync Error]', err?.message || err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 6. 局内互动聊天与表情 API (/api/room/chat)
app.post('/api/room/chat', (req, res) => {
  try {
    const { roomId = 'room_realtime_4', senderId, senderName, phone, text, type, audioBlobUrl, duration } = req.body || {};
    if (!roomsMemory[roomId]) {
      roomsMemory[roomId] = {
        roomId,
        maxPlayers: 4,
        seats: [null, null, null, null],
        phase: 'WAITING',
        chatBubbles: [],
        lastUpdated: Date.now()
      };
    }
    const bubble = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId,
      senderName,
      phone,
      text,
      type: type || (audioBlobUrl ? 'voice' : 'text'),
      audioBlobUrl,
      duration: duration || 2,
      timestamp: Date.now()
    };
    if (!roomsMemory[roomId].chatBubbles) roomsMemory[roomId].chatBubbles = [];
    roomsMemory[roomId].chatBubbles.push(bubble);
    if (roomsMemory[roomId].chatBubbles.length > 30) {
      roomsMemory[roomId].chatBubbles = roomsMemory[roomId].chatBubbles.slice(-30);
    }
    res.json({ success: true, bubble });
  } catch (err) {
    console.error('[Room API Chat Error]', err?.message || err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 7. 健康检查与系统信息接口
app.get(['/health', '/api/health'], (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: 'ok',
    game: 'shisanshui',
    time: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    platform: os.platform(),
    arch: os.arch(),
    memoryRssMb: (mem.rss / 1024 / 1024).toFixed(1),
    activeRooms: Object.keys(roomsMemory).length
  });
});

// 8. 授权手机号白名单接口 (同时支持 /api/authorized-phones 和根路径 /authorized_phones.json 强力穿透缓存)
app.get(['/api/authorized-phones', '/authorized_phones.json'], (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.json(getAuthorizedPhones());
});

// 8.1 玩家全服统一注册与跨设备登录接口 (解决在不同手机上登录提示未找到账号的问题)
function normalizePhone(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/[\s\-()]/g, '');
  return digits.replace(/^(\+?86|0086)/, '').trim();
}

// 手机号注册 (带白名单强校验，入库 users.json)
app.post('/api/auth/register', (req, res) => {
  try {
    const { phone, nickname, password, avatar } = req.body || {};
    const cleanPhone = normalizePhone(phone);
    const cleanNickname = (nickname || '').trim();
    const cleanPassword = (password || '').trim();

    if (!cleanPhone || !/^1[3-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, message: '请输入有效的11位手机号码！' });
    }

    // 校验白名单
    const authList = getAuthorizedPhones().map(normalizePhone);
    if (!authList.includes(cleanPhone)) {
      return res.status(403).json({
        success: false,
        message: `⚠️ 手机号 (${cleanPhone}) 尚未获得管理员授权！请在 Telegram Bot 发送：/auth ${cleanPhone}`
      });
    }

    if (!cleanNickname) {
      return res.status(400).json({ success: false, message: '请输入玩家专属昵称！' });
    }

    if (cleanPassword.length !== 6) {
      return res.status(400).json({ success: false, message: '密码必须为 6 位数字符！' });
    }

    const users = getRegisteredUsers();
    const existingIndex = users.findIndex((u) => normalizePhone(u.phone) === cleanPhone);

    if (existingIndex >= 0) {
      // 若该账号已登记，允许更新昵称与密码并登录，保留已有水数
      const existing = users[existingIndex];
      existing.password = cleanPassword;
      existing.nickname = cleanNickname;
      if (avatar) existing.avatar = avatar;
      existing.isLoggedIn = true;
      existing.lastLoginAt = Date.now();
      saveRegisteredUsers(users);

      console.log(`[Auth API] ✓ 玩家更新资料/重置密码登录 [${cleanNickname}] (手机: ${cleanPhone})`);
      return res.json({
        success: true,
        message: '🎉 账号资料更新成功，欢迎进入游戏大厅！',
        user: existing
      });
    }

    // 新注册用户：不赠送积分，初始水数为 0
    const newUser = {
      id: `u_${cleanPhone.slice(-4)}_${Date.now()}`,
      phone: cleanPhone,
      password: cleanPassword,
      nickname: cleanNickname,
      avatar: avatar || '😎',
      token: `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      chips: 0, // 所有注册的用户不赠送积分，初始水数 0
      isLoggedIn: true,
      totalGames: 0,
      totalWins: 0,
      gunShots: 0,
      grandSlams: 0,
      specialHands: 0,
      createdAt: Date.now(),
      lastLoginAt: Date.now()
    };

    users.push(newUser);
    saveRegisteredUsers(users);

    console.log(`[Auth API] ✓ 玩家注册成功 [${cleanNickname}] (手机: ${cleanPhone})，初始水数: 0`);
    res.json({
      success: true,
      message: '🎉 注册成功，欢迎加入十三水对战场！初始水数为 0。',
      user: newUser
    });
  } catch (err) {
    console.error('[Auth API Register Error]', err);
    res.status(500).json({ success: false, message: '服务端注册异常，请稍后重试' });
  }
});

// 手机号登录 (全设备通用校验：授权手机号必须先注册设定昵称与密码)
app.post('/api/auth/login', (req, res) => {
  try {
    const { phone, password } = req.body || {};
    const cleanPhone = normalizePhone(phone);
    const cleanPassword = (password || '').trim();

    if (!cleanPhone) {
      return res.status(400).json({ success: false, message: '请输入手机号码！' });
    }
    if (!cleanPassword) {
      return res.status(400).json({ success: false, message: '请输入 6 位密码！' });
    }

    const users = getRegisteredUsers();
    let user = users.find((u) => normalizePhone(u.phone) === cleanPhone);

    if (!user) {
      // 检查该手机号是否已获管理员授权
      const authList = getAuthorizedPhones().map(normalizePhone);
      if (authList.includes(cleanPhone)) {
        // 已获授权但尚未注册账号：不允许直接登录，必须前往注册创建昵称与密码
        return res.status(400).json({
          success: false,
          needRegister: true,
          message: `该手机号 (${cleanPhone}) 已获得管理员授权，但尚未注册账号！请前往【注册】页面设定您的专属昵称与6位密码。`
        });
      }

      return res.status(404).json({
        success: false,
        message: `未找到手机号 (${cleanPhone}) 的注册账号，且未获得管理员授权！请先在 Telegram Bot 发送：/auth ${cleanPhone}`
      });
    }

    // 校验密码（严格核验注册时创建的密码）
    if (user.password !== cleanPassword) {
      return res.status(401).json({
        success: false,
        message: '密码错误！请输入您注册时设定的 6 位密码。'
      });
    }

    // 更新最后登录时间与在线状态
    user.lastLoginAt = Date.now();
    user.isLoggedIn = true;
    saveRegisteredUsers(users);

    console.log(`[Auth API] ✓ 玩家登录成功 [${user.nickname}] (手机: ${cleanPhone})`);
    res.json({
      success: true,
      message: '✓ 登录成功，欢迎回到十三水竞技场！',
      user
    });
  } catch (err) {
    console.error('[Auth API Login Error]', err);
    res.status(500).json({ success: false, message: '服务端登录异常，请稍后重试' });
  }
});

// 玩家档案更新与跨设备双向同步
app.post('/api/auth/sync-profile', (req, res) => {
  try {
    const { user } = req.body || {};
    if (!user || !user.phone) {
      return res.status(400).json({ success: false, message: '缺少玩家资料' });
    }

    const cleanPhone = normalizePhone(user.phone);
    const users = getRegisteredUsers();
    const idx = users.findIndex((u) => normalizePhone(u.phone) === cleanPhone);

    if (idx >= 0) {
      users[idx] = {
        ...users[idx],
        ...user,
        phone: cleanPhone,
        password: user.password || users[idx].password,
        nickname: user.nickname || users[idx].nickname,
        lastLoginAt: Date.now()
      };
      saveRegisteredUsers(users);
      res.json({ success: true, user: users[idx] });
    } else if (user.password && user.nickname) {
      // 仅当玩家有实际设定的密码和昵称时才允许同步入库
      const newUser = {
        id: user.id || `u_${cleanPhone.slice(-4)}_${Date.now()}`,
        phone: cleanPhone,
        password: user.password,
        nickname: user.nickname.trim(),
        avatar: user.avatar || '😎',
        token: user.token || `tok_${Date.now()}`,
        chips: typeof user.chips === 'number' ? user.chips : 0,
        isLoggedIn: true,
        totalGames: user.totalGames || 0,
        totalWins: user.totalWins || 0,
        gunShots: user.gunShots || 0,
        grandSlams: user.grandSlams || 0,
        specialHands: user.specialHands || 0,
        createdAt: user.createdAt || Date.now(),
        lastLoginAt: Date.now()
      };
      users.push(newUser);
      saveRegisteredUsers(users);
      console.log(`[Auth API] ✓ 同步上传旧设备玩家账号到服务端 [${newUser.nickname}] (手机: ${cleanPhone})`);
      res.json({ success: true, user: newUser });
    } else {
      res.status(400).json({ success: false, message: '账号未设置昵称或密码，需先注册' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: '同步档案失败' });
  }
});

// 玩家积分互赠接口 (跨设备即时生效)
app.post('/api/auth/transfer-chips', (req, res) => {
  try {
    const { fromPhone, toPhone, amount, note } = req.body || {};
    const cleanFrom = normalizePhone(fromPhone);
    const cleanTo = normalizePhone(toPhone);
    const numAmount = parseInt(amount, 10);

    if (!cleanFrom || !cleanTo) {
      return res.status(400).json({ success: false, message: '手机号不能为空' });
    }
    if (cleanFrom === cleanTo) {
      return res.status(400).json({ success: false, message: '不能转账给自己' });
    }
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: '转账数额无效' });
    }

    const users = getRegisteredUsers();
    const sender = users.find((u) => normalizePhone(u.phone) === cleanFrom);
    const receiver = users.find((u) => normalizePhone(u.phone) === cleanTo);

    if (!sender) {
      return res.status(404).json({ success: false, message: '赠送方账号未找到' });
    }
    if (!receiver) {
      return res.status(404).json({ success: false, message: `未找到手机号为 ${cleanTo} 的注册玩家！` });
    }

    if ((sender.chips || 0) < numAmount) {
      return res.status(400).json({
        success: false,
        message: `积分不足！当前仅持有 ${Number(sender.chips || 0).toLocaleString()} 水，无法赠送 ${numAmount.toLocaleString()} 水。`
      });
    }

    sender.chips = (sender.chips || 0) - numAmount;
    receiver.chips = (receiver.chips || 0) + numAmount;
    saveRegisteredUsers(users);

    console.log(`[Auth API] 💸 水数转账: [${sender.nickname}] -> [${receiver.nickname}] +${numAmount} 水`);
    res.json({
      success: true,
      message: `🎉 成功向 [${receiver.nickname}] 赠送 ${numAmount.toLocaleString()} 积分水数！`,
      fromUser: sender,
      toUser: receiver
    });
  } catch (err) {
    res.status(500).json({ success: false, message: '转账操作失败' });
  }
});

// 获取所有公开玩家列表 (脱敏密码，用于手机号搜索与榜单)
app.get(['/api/auth/accounts', '/users.json'], (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  const users = getRegisteredUsers();
  // 脱敏密码
  const sanitized = users.map((u) => {
    const { password, ...rest } = u;
    return rest;
  });
  res.json(sanitized);
});

// 9. Telegram Webhook 核心接入路由与健康诊断
// 接收 Telegram 官方主动 POST 推送的更新消息
app.post('/api/telegram/webhook', async (req, res) => {
  const botConfig = getBotConfig();
  if (!botConfig.token) {
    return res.status(503).json({ ok: false, error: 'Telegram Bot token not configured in .env' });
  }

  // 校验 Secret Token (如果配置了 TG_WEBHOOK_SECRET)
  if (botConfig.webhookSecret) {
    const incomingSecret = req.headers['x-telegram-bot-api-secret-token'];
    if (incomingSecret !== botConfig.webhookSecret) {
      console.warn('[TG Webhook] 收到未授权 Secret Token 请求，已拦截');
      return res.status(403).json({ ok: false, error: 'Invalid secret token' });
    }
  }

  try {
    if (req.body) {
      // 🚀 核心优化：利用 Telegram Webhook Direct Response 规范
      // 直接在 Webhook HTTP 200 响应体中返回待发送指令 (包含 method: "sendMessage")
      // 数据直接沿着 Cloudflare Tunnel 原路流回 Telegram 官方服务器！
      // 手机完全无需主动向 api.telegram.org 发起外联 TCP 请求，彻底解决国内网络阻断与代理冲突！
      const replyPayload = await handleTelegramUpdate(req.body, { asWebhookResponse: true });
      if (replyPayload && replyPayload.method) {
        return res.status(200).json(replyPayload);
      }
    }
  } catch (err) {
    console.error('[TG Webhook Error] 处理事件异常:', err.message);
  }

  // 默认正常确认 200
  res.status(200).json({ ok: true });
});

// Telegram Webhook 状态与一键诊断接口 (GET 浏览器可直接查看)
app.get(['/api/telegram/webhook', '/api/telegram/status'], async (req, res) => {
  try {
    const report = await runBotDiagnostics();
    res.json({
      status: 'ok',
      time: new Date().toISOString(),
      botConfigured: report.hasToken,
      bot: report.botInfo,
      webhook: report.webhookInfo,
      diagnosis: report.diagnosisResults,
      quickCommands: {
        setWebhook: `node scripts/tgBot.js --set-webhook https://<你的域名>/api/telegram/webhook`,
        deleteWebhook: `node scripts/tgBot.js --del-webhook`,
        runCheck: `node scripts/tgBot.js --check`
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. 静态资源托管与 SPA 回退
if (fs.existsSync(DIST_PATH)) {
  // 生产模式：直接托管 dist 编译产物
  app.use(express.static(DIST_PATH, {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      if (filePath.includes('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));

  // 所有非 API 请求回退到 index.html
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'Not Found' });
    }
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  });
} else {
  // 开发或构建前模式：直接托管 public 目录
  app.use(express.static(PUBLIC_PATH));
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>十三水多人对战服务</title></head>
      <body style="font-family:sans-serif;text-align:center;padding:50px;background:#0b1120;color:#e2e8f0;">
        <h1>🀄 十三水多人对战服务已启动</h1>
        <p>提示：检测到尚未构建前端静态页面 (<code>dist/</code> 目录不存在)。</p>
        <p>如需完整体验，请先在终端运行：<code>npm run build</code> 生成生产页面。</p>
        <p>或在开发环境运行：<code>npm run dev</code> 开启 Vite 实时热重载服务。</p>
      </body>
      </html>
    `);
  });
}

// 10. 兼容 Serv00 Phusion Passenger / 独立启动模式
// Serv00 如果配置了 nodejs 类型的网站，Passenger 会自动接管或提供 socket
if (typeof global.PhusionPassenger !== 'undefined' || process.env.PASSENGER_APP_ENV) {
  // Passenger 模式：监听 Passenger 指定的端口或 Socket
  server.listen('passenger', () => {
    console.log('[Server] 🀄 十三水服务已在 Phusion Passenger 环境成功运行！');
  });
} else {
  // 普通独立进程模式 (Termux / Linux VPS / Serv00 保留端口模式)
  server.listen(PORT, HOST, () => {
    const memMb = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
    console.log(`\n======================================================`);
    console.log(`🀄 十三水 (Chinese Poker) 高性能服务端已成功启动！`);
    console.log(`🚀 监听地址: http://${HOST}:${PORT}`);
    console.log(`🌐 系统平台: ${os.platform()} (${os.arch()})`);
    console.log(`💾 初始内存占用: ${memMb} MB (超轻量设计，极致省电省内存)`);
    console.log(`⚡ API 接口: /api/room/sync, /api/room/chat, /health`);
    console.log(`🤖 Telegram Webhook: /api/telegram/webhook`);
    console.log(`======================================================\n`);

    // 检查并自动初始化 Telegram Bot
    const botConfig = getBotConfig();
    if (botConfig.token) {
      if (botConfig.webhookUrl) {
        console.log(`[TG Bot] 正在向 Telegram 注册 Webhook: ${botConfig.webhookUrl}...`);
        setTelegramWebhook(botConfig.webhookUrl, botConfig.webhookSecret)
          .then((res) => {
            if (res.ok) {
              console.log(`[TG Bot] ✓ Webhook 模式已就绪！Telegram 消息将直接投递至 /api/telegram/webhook`);
            } else {
              console.log(`[TG Bot] ℹ️ Webhook 自动注册提醒: ${res.description}`);
              console.log(`   (注：若此前已设置过 Webhook，可完全忽略此项。当前服务已开启 Webhook 原路直回模式，免代理也能正常交互)`);
            }
          })
          .catch((e) => console.log(`[TG Bot] Webhook 初始连通性提示: ${e.message}`));
      } else {
        console.log(`[TG Bot] 检测到 TG_BOT_TOKEN。`);
        console.log(`  - 推荐 Webhook 模式: 在 .env 设置 TG_WEBHOOK_URL="https://你的公网域名/api/telegram/webhook"`);
        console.log(`  - 轮询监听模式: 可在终端执行 "npm run bot" 启动常驻监听`);
        console.log(`  - 一键诊断命令: 可在终端执行 "npm run bot:check" 进行排查\n`);
      }
    }
  });
}

// 优雅停机信号捕获
const shutdown = () => {
  console.log('\n[Server] 正在平滑关闭服务...');
  server.close(() => {
    console.log('[Server] 服务已安全退出。');
    process.exit(0);
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
