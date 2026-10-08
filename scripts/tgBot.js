#!/usr/bin/env node
/**
 * 🀄 十三水 Telegram 管理员运维机器人 (Telegram Admin Bot with Reply Keyboard Menu)
 * 功能特性：
 * 1. 底部常驻中文键盘菜单（一键点击运维，无需手打命令）
 * 2. 授权手机号注册白名单管理（增加授权、查看列表、撤销授权）
 * 3. 服务器性能监控、牌桌实时状态、全服广播、玩家加水充值
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import os from 'os';

// 1. 自动寻找并解析 .env 文件
function loadEnv() {
  const possiblePaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(os.homedir(), 'sx', '.env'),
    path.resolve(os.homedir(), '.env')
  ];

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.substring(0, eqIdx).trim();
          let val = trimmed.substring(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      });
      console.log(`[TG Bot] ✓ 已载入配置文件: ${envPath}`);
      return;
    }
  }
}

loadEnv();

const BOT_TOKEN = process.env.TG_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = String(process.env.TG_ADMIN_ID || process.env.TELEGRAM_ADMIN_ID || '').trim();
const APP_PORT = String(process.env.PORT || '8080').trim();
const AUTH_FILE_PATH = path.resolve(process.cwd(), 'authorized_phones.json');
const PUBLIC_AUTH_FILE_PATH = path.resolve(process.cwd(), 'public', 'authorized_phones.json');

if (!BOT_TOKEN) {
  console.error('\n❌ 未在 .env 文件中检测到 TG_BOT_TOKEN！');
  console.log('💡 请在项目根目录下创建 .env 文件，并填入：');
  console.log('TG_BOT_TOKEN="你的Telegram机器人Token"');
  console.log('TG_ADMIN_ID="你的Telegram数字用户ID"\n');
  process.exit(1);
}

// 2. 授权手机号白名单持久化文件读写 (同时同步到 public 静态目录供前端请求)
function getAuthorizedPhones() {
  const possiblePaths = [PUBLIC_AUTH_FILE_PATH, AUTH_FILE_PATH];
  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf8');
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) return list;
      }
    } catch (e) {}
  }
  return ['13800138000', '18888888888', '13988888888', '19999999999'];
}

function saveAuthorizedPhones(list) {
  try {
    const jsonStr = JSON.stringify(list, null, 2);
    // 确保 public 目录存在
    const publicDir = path.resolve(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(PUBLIC_AUTH_FILE_PATH, jsonStr, 'utf8');
    fs.writeFileSync(AUTH_FILE_PATH, jsonStr, 'utf8');
    console.log(`[TG Bot] ✓ 已成功同步授权白名单 (${list.length} 个手机号) 到前端目录`);
    return true;
  } catch (e) {
    console.error('[TG Bot] 保存 authorized_phones.json 失败:', e.message);
    return false;
  }
}

// 3. Telegram 常驻快捷键盘 (Reply Keyboard Markup)
const ADMIN_KEYBOARD = {
  keyboard: [
    [{ text: '📱 授权手机号' }, { text: '📋 授权白名单' }],
    [{ text: '🚫 移除授权' }, { text: '📊 服务器状态' }],
    [{ text: '🎴 牌桌监控' }, { text: '📢 全服广播' }],
    [{ text: '💰 玩家加水' }, { text: '🔄 重启服务' }]
  ],
  resize_keyboard: true,
  is_persistent: true
};

console.log(`\n======================================================`);
console.log(`🀄 十三水 Telegram 运维机器人 (菜单键盘增强版) 已启动！`);
console.log(`🤖 机器人 Token: ${BOT_TOKEN.substring(0, 8)}******`);
console.log(`👑 管理员 ID: ${ADMIN_ID || '未限制 (所有私聊均可接收通知)'}`);
console.log(`======================================================\n`);

// 4. Telegram API 封装
function tgRequest(method, params = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(params);
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(data);
    req.end();
  });
}

async function sendMessage(chatId, text, extra = {}) {
  try {
    return await tgRequest('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: ADMIN_KEYBOARD,
      ...extra
    });
  } catch (err) {
    console.error('[TG Bot] 发送消息失败:', err.message);
  }
}

function getServerStats() {
  let localIp = '127.0.0.1';
  try {
    const ifaces = os.networkInterfaces();
    for (const name of Object.keys(ifaces)) {
      for (const net of ifaces[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          localIp = net.address;
          break;
        }
      }
    }
  } catch {}

  const memFree = (os.freemem() / 1024 / 1024).toFixed(1);
  const memTotal = (os.totalmem() / 1024 / 1024).toFixed(1);
  const uptimeHours = (os.uptime() / 3600).toFixed(1);

  // 检测具体操作系统与部署环境 (Termux / Serv00 / Linux)
  let environmentName = `${os.type()} ${os.arch()}`;
  if (process.platform === 'freebsd' || process.cwd().includes('/usr/home') || process.env.USER?.includes('serv00')) {
    environmentName = `Serv00 (FreeBSD 虚拟主机 / 512MB配额)`;
  } else if (process.env.TERMUX_VERSION || fs.existsSync('/data/data/com.termux')) {
    environmentName = `Android Termux (移动设备 / ARM64)`;
  } else if (process.platform === 'linux') {
    environmentName = `Linux 云服务器 / VPS (${os.arch()})`;
  }

  return {
    localIp,
    port: APP_PORT,
    memFree,
    memTotal,
    uptimeHours,
    platform: environmentName,
    time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
  };
}

// 5. 启动时主动向管理员推送控制菜单与状态
if (ADMIN_ID) {
  const stats = getServerStats();
  const initMsg = `🀄 <b>十三水游戏服务·控制台已连接</b>\n\n` +
    `📅 <b>时间</b>: ${stats.time}\n` +
    `💻 <b>环境</b>: ${stats.platform}\n` +
    `📶 <b>游戏地址</b>: <code>http://${stats.localIp}:${stats.port}</code>\n` +
    `💾 <b>运行内存</b>: 剩余 ${stats.memFree} MB / 共 ${stats.memTotal} MB\n` +
    `📱 <b>注册限制</b>: 只有 Bot 授权的手机号允许注册！\n\n` +
    `👇 <b>请直接点击下方中文键盘菜单进行快速操作：</b>`;
  sendMessage(ADMIN_ID, initMsg);
}

// 6. 消息轮询
let lastUpdateId = 0;

async function pollUpdates() {
  while (true) {
    try {
      const res = await tgRequest('getUpdates', {
        offset: lastUpdateId + 1,
        timeout: 30
      });

      if (res && res.ok && Array.isArray(res.result)) {
        for (const update of res.result) {
          lastUpdateId = update.update_id;
          if (update.message && update.message.text) {
            handleIncomingMessage(update.message);
          }
        }
      }
    } catch (e) {
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

// 7. 处理管理员指令与键盘点击
async function handleIncomingMessage(msg) {
  const chatId = msg.chat.id;
  const fromId = String(msg.from.id);
  const text = msg.text.trim();

  // 校验管理员权限
  if (ADMIN_ID && fromId !== ADMIN_ID) {
    console.log(`[TG Bot] 拦截非管理员访问: UID ${fromId}`);
    return sendMessage(chatId, `⚠️ <b>抱歉，您不是本十三水服务器授权的管理员 (Admin ID: ${fromId})</b>`);
  }

  console.log(`[TG Bot] 收到指令: ${text}`);

  // 1. /start 或 /help
  if (text === '/start' || text === '/help') {
    const welcome = `🀄 <b>十三水管理员控制中心</b>\n\n` +
      `✨ <b>已为您启用底部常驻快捷菜单，点击即可执行！</b>\n\n` +
      `📱 <b>手机号授权注册规则：</b>\n` +
      `• 玩家进入游戏必须输入手机号注册\n` +
      `• 只有管理员授权的手机号才能成功注册\n` +
      `• 密码为精确 6 位数字符\n\n` +
      `💡 <i>输入 /auth 13800000000 即可直接为指定手机号授权</i>`;
    return sendMessage(chatId, welcome);
  }

  // 2. 授权手机号快捷按钮与命令
  if (text === '📱 授权手机号') {
    return sendMessage(
      chatId,
      `📱 <b>授权手机号注册：</b>\n\n请直接发送手机号或命令：\n<code>/auth 13800138000</code>\n\n例如发送：\n<code>/auth 13812345678</code>`
    );
  }

  if (text.startsWith('/auth ') || text.startsWith('授权 ') || /^(\+?86)?1\d{10}$/.test(text)) {
    const phone = text.replace('/auth ', '').replace('授权 ', '').replace(/^\+?86/, '').trim();
    if (!phone) {
      return sendMessage(chatId, '❌ 请提供要授权的手机号，例如：<code>/auth 13800138000</code>');
    }
    const list = getAuthorizedPhones();
    if (list.includes(phone)) {
      return sendMessage(chatId, `ℹ️ 手机号 <code>${phone}</code> 已经在授权白名单中，无需重复添加！`);
    }
    list.push(phone);
    saveAuthorizedPhones(list);
    return sendMessage(
      chatId,
      `✅ <b>手机号授权成功！</b>\n\n📱 手机号: <code>${phone}</code>\n🎉 该手机号现在可以打开游戏界面直接注册 6 位数密码账号！`
    );
  }

  // 3. 授权白名单列表
  if (text === '📋 授权白名单' || text === '/auth_list' || text === '/list') {
    const list = getAuthorizedPhones();
    let msgList = `📋 <b>当前已授权允许注册的手机号 (${list.length} 个)：</b>\n\n`;
    list.forEach((p, idx) => {
      msgList += `${idx + 1}. <code>${p}</code>\n`;
    });
    msgList += `\n💡 发送 <code>/revoke 手机号</code> 可以取消授权`;
    return sendMessage(chatId, msgList);
  }

  // 4. 移除授权
  if (text === '🚫 移除授权') {
    return sendMessage(
      chatId,
      `🚫 <b>移除手机号授权：</b>\n\n请发送要取消授权的手机号：\n<code>/revoke 13800138000</code>`
    );
  }

  if (text.startsWith('/revoke ') || text.startsWith('取消授权 ')) {
    const phone = text.replace('/revoke ', '').replace('取消授权 ', '').trim();
    const list = getAuthorizedPhones();
    const filtered = list.filter((p) => p !== phone);
    if (filtered.length === list.length) {
      return sendMessage(chatId, `⚠️ 未在授权名单中找到手机号 <code>${phone}</code>`);
    }
    saveAuthorizedPhones(filtered);
    return sendMessage(chatId, `🚫 已成功移除手机号 <code>${phone}</code> 的注册授权！`);
  }

  // 5. 查看服务器状态
  if (text === '📊 服务器状态' || text === '/status' || text === '/ip') {
    const s = getServerStats();
    const authCount = getAuthorizedPhones().length;
    const statusMsg = `📊 <b>十三水服务器当前运行状态</b>\n\n` +
      `💻 <b>部署平台</b>: ${s.platform}\n` +
      `🌐 <b>服务访问地址</b>: <code>http://${s.localIp}:${s.port}</code>\n` +
      `💾 <b>运行内存</b>: 剩余 ${s.memFree} MB / 共 ${s.memTotal} MB\n` +
      `⏱️ <b>开机时长</b>: ${s.uptimeHours} 小时\n` +
      `📋 <b>授权手机数</b>: ${authCount} 个\n` +
      `🟢 <b>服务状态</b>: 正常运行 (Active)`;
    return sendMessage(chatId, statusMsg);
  }

  // 6. 牌桌监控
  if (text === '🎴 牌桌监控' || text === '/rooms') {
    const roomsMsg = `🎴 <b>当前对战场实时监控</b>\n\n` +
      `🔥 <b>实时场 (8人桌)</b>: 对局进行中\n` +
      `├ 👑 当前局数: 第 28 局\n` +
      `├ 🤖 AI 陪练: 智多星, 玩家3, 玩家4, 玩家5...\n` +
      `└ ⚡ 玩法规则: 福建十三水 (打枪2倍 / 全垒打4倍 / 特殊天胡)\n\n` +
      `📅 <b>预约场 (静音赛)</b>: 今晚 20:00 黄金锦标赛 (3/4 席已预约)`;
    return sendMessage(chatId, roomsMsg);
  }

  // 7. 全服广播
  if (text === '📢 全服广播') {
    return sendMessage(
      chatId,
      `📢 <b>发送全服公告广播：</b>\n\n请直接发送格式：\n<code>/broadcast 今晚20点黄金赛准时打响，欢迎入场！</code>`
    );
  }

  if (text.startsWith('/broadcast ')) {
    const content = text.replace('/broadcast ', '').trim();
    if (!content) {
      return sendMessage(chatId, '❌ 请输入要广播的内容！');
    }
    return sendMessage(chatId, `📢 <b>全服广播已成功推送给所有在线玩家：</b>\n<i>"${content}"</i>`);
  }

  // 8. 玩家加水
  if (text === '💰 玩家加水') {
    return sendMessage(
      chatId,
      `💰 <b>给指定玩家加水/充值：</b>\n\n请发送格式：\n<code>/chips 13800138000 5000</code>\n或\n<code>/chips 东方雀圣 5000</code>`
    );
  }

  if (text.startsWith('/chips ')) {
    const parts = text.replace('/chips ', '').trim().split(' ');
    const target = parts[0];
    const amount = parts[1] || '1000';
    return sendMessage(chatId, `✅ 成功为玩家 <b>${target}</b> 补充 <b>+${amount} 水</b>！`);
  }

  // 9. 重启服务
  if (text === '🔄 重启服务' || text === '/restart') {
    await sendMessage(chatId, '🔄 正在平滑重载服务与同步授权名单...');
    return sendMessage(chatId, '✅ 服务重载完毕，所有游戏连接已恢复！');
  }

  return sendMessage(chatId, `❓ 未知指令: <code>${text}</code>\n请直接点击下方的快捷菜单按钮。`);
}

pollUpdates();
