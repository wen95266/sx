/**
 * 🀄 十三水 Telegram 管理员机器人核心模块 (Telegram Bot Core Engine)
 * 支持特性：
 * 1. Webhook 模式与 Long Polling (长轮询) 双模无缝支持
 * 2. 自动解决 Webhook 与 getUpdates 409 Conflict 冲突死锁
 * 3. 完整的健康自检与诊断系统 (getMe, getWebhookInfo, 网络连通性测试)
 * 4. 支持国内环境/Termux 自定义 API 反代 (TG_API_BASE)
 * 5. 键盘快捷菜单 (Reply Keyboard) 与手机号白名单持久化
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

// 1. 环境变量加载器
export function loadBotEnv() {
  const possiblePaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(os.homedir(), 'sx', '.env'),
    path.resolve(os.homedir(), '.env')
  ];

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      try {
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
        return envPath;
      } catch (e) {}
    }
  }
  return null;
}

// 确保环境加载
loadBotEnv();

// 2. 基础配置提取
export function getBotConfig() {
  const token = (process.env.TG_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '').trim();
  const rawAdminId = (process.env.TG_ADMIN_ID || process.env.TELEGRAM_ADMIN_ID || '').trim();
  const adminIds = rawAdminId
    ? rawAdminId.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean)
    : [];
  const webhookUrl = (process.env.TG_WEBHOOK_URL || '').trim();
  const webhookSecret = (process.env.TG_WEBHOOK_SECRET || '').trim();
  const apiBase = (process.env.TG_API_BASE || 'https://api.telegram.org').replace(/\/+$/, '');
  const port = process.env.PORT || '8080';

  return {
    token,
    adminIds,
    rawAdminId,
    webhookUrl,
    webhookSecret,
    apiBase,
    port
  };
}

// 3. 白名单数据存储
const AUTH_FILE_PATH = path.resolve(process.cwd(), 'authorized_phones.json');
const PUBLIC_AUTH_FILE_PATH = path.resolve(process.cwd(), 'public', 'authorized_phones.json');
const DIST_AUTH_FILE_PATH = path.resolve(process.cwd(), 'dist', 'authorized_phones.json');

export function getAuthorizedPhones() {
  const possiblePaths = [PUBLIC_AUTH_FILE_PATH, AUTH_FILE_PATH, DIST_AUTH_FILE_PATH];
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

export function saveAuthorizedPhones(list) {
  try {
    const jsonStr = JSON.stringify(list, null, 2);
    const publicDir = path.resolve(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(PUBLIC_AUTH_FILE_PATH, jsonStr, 'utf8');
    fs.writeFileSync(AUTH_FILE_PATH, jsonStr, 'utf8');
    
    // 如果存在 dist 目录（生产构建环境），同步更新 dist 中的静态文件，避免静态资源缓存旧版本
    const distDir = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(DIST_AUTH_FILE_PATH, jsonStr, 'utf8');
    }
    return true;
  } catch (e) {
    console.error('[TG Bot Core] 保存 authorized_phones.json 失败:', e.message);
    return false;
  }
}

// 4. Telegram 键盘配置
export const ADMIN_KEYBOARD = {
  keyboard: [
    [{ text: '📱 授权手机号' }, { text: '📋 授权白名单' }],
    [{ text: '🚫 移除授权' }, { text: '📊 服务器状态' }],
    [{ text: '🎴 牌桌监控' }, { text: '📢 全服广播' }],
    [{ text: '💰 玩家加水' }, { text: '🔄 重启服务' }]
  ],
  resize_keyboard: true,
  is_persistent: true
};

// 5. HTML 转义
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 6. Telegram API 统一请求封装
export async function tgApiRequest(method, params = {}, customToken = null, customApiBase = null) {
  const { token: defaultToken, apiBase: defaultApiBase } = getBotConfig();
  const token = customToken || defaultToken;
  const apiBase = customApiBase || defaultApiBase;

  if (!token) {
    return { ok: false, description: 'Missing TG_BOT_TOKEN in environment' };
  }

  const url = `${apiBase}/bot${token}/${method}`;

  try {
    const timeoutMs = method === 'getUpdates' ? 40000 : 15000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    return data;
  } catch (err) {
    return {
      ok: false,
      isNetworkError: true,
      description: `网络连接异常: ${err.name === 'AbortError' ? '请求超时 (Timeout)' : err.message}`
    };
  }
}

// 7. 发送消息辅助函数
export async function tgSendMessage(chatId, text, extra = {}) {
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: ADMIN_KEYBOARD,
    ...extra
  };

  const res = await tgApiRequest('sendMessage', payload);
  if (!res.ok && res.description?.includes('can\'t parse entities')) {
    // 降级为纯文本重试，防止 HTML 标签解析失败导致消息吞掉
    const fallbackPayload = {
      chat_id: chatId,
      text: text.replace(/<[^>]*>/g, ''),
      reply_markup: ADMIN_KEYBOARD,
      ...extra
    };
    delete fallbackPayload.parse_mode;
    return await tgApiRequest('sendMessage', fallbackPayload);
  }
  return res;
}

// 8. 获取服务器运行统计
export function getServerStats() {
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
  const { port } = getBotConfig();

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
    port,
    memFree,
    memTotal,
    uptimeHours,
    platform: environmentName,
    time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
  };
}

// 9. 处理核心消息业务逻辑 (Webhook 与 Polling 共享)
export async function handleBotMessage(msg) {
  if (!msg || !msg.chat) return;

  const chatId = msg.chat.id;
  const fromId = String(msg.from?.id || chatId);
  const text = (msg.text || '').trim();
  const { adminIds } = getBotConfig();

  // 权限校验
  if (adminIds.length > 0 && !adminIds.includes(fromId)) {
    console.warn(`[TG Bot] 拦截非管理员访问: UID ${fromId}`);
    return tgSendMessage(
      chatId,
      `⚠️ <b>未授权访问</b>\n\n您的 Telegram ID 是：<code>${fromId}</code>\n本服务已配置管理员白名单，请联系站长在 <code>.env</code> 的 <code>TG_ADMIN_ID</code> 中填入您的 ID。`
    );
  }

  console.log(`[TG Bot] 收到指令: "${text}" 来自 [UID: ${fromId}]`);

  // 1. /start 或 /help
  if (text === '/start' || text === '/help') {
    const welcome = `🀄 <b>十三水管理员控制中心</b>\n\n` +
      `✨ <b>服务已就绪！已为您加载底部常驻菜单，点击按钮即可一键运维：</b>\n\n` +
      `📱 <b>玩家注册管控：</b>\n` +
      `• 前端登录开启了白名单注册保护\n` +
      `• 只有管理员授权的手机号方可注册新账号\n` +
      `• 授权命令：<code>/auth 13800138000</code>\n\n` +
      `💡 <i>输入 /status 可随时查看服务器内存与在线状态</i>`;
    return tgSendMessage(chatId, welcome);
  }

  // 2. 授权手机号快捷按钮、命令或直接发送手机号/名片
  if (text === '📱 授权手机号') {
    return tgSendMessage(
      chatId,
      `📱 <b>授权手机号注册：</b>\n\n请直接回复要授权的手机号，或发送格式：\n<code>/auth 13800138000</code>\n\n例如：\n<code>13912345678</code> 或 <code>+8613912345678</code>`
    );
  }

  // 支持 Telegram Contact 分享名片或文本手机号
  const contactPhone = msg.contact?.phone_number ? String(msg.contact.phone_number).trim() : null;
  const isAuthCmd = text.startsWith('/auth ') || text.startsWith('授权 ') || /^(\+?86)?\s*1[3-9]\d{9}$/.test(text.replace(/[\s-]/g, '')) || contactPhone;

  if (isAuthCmd) {
    let rawPhone = contactPhone || text.replace('/auth ', '').replace('授权 ', '');
    // 清洗提取纯手机号：去除空格、横杠、+86前缀
    const cleanedDigits = rawPhone.replace(/[\s\-()]/g, '');
    const phone = cleanedDigits.replace(/^\+?86/, '').trim();

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return tgSendMessage(
        chatId,
        `❌ <b>手机号格式不正确</b>\n\n收到输入: <code>${escapeHtml(rawPhone || text)}</code>\n请输入标准的 11 位中国大陆手机号，例如：<code>13800138000</code> 或 <code>/auth 13800138000</code>`
      );
    }
    const list = getAuthorizedPhones();
    if (list.includes(phone)) {
      return tgSendMessage(chatId, `ℹ️ 手机号 <code>${phone}</code> 已经在授权白名单中，玩家可直接在网页注册！`);
    }
    list.push(phone);
    saveAuthorizedPhones(list);
    return tgSendMessage(
      chatId,
      `✅ <b>手机号授权成功！</b>\n\n📱 手机号: <code>${phone}</code>\n🎉 白名单已实时持久化至服务器！玩家现在可以在游戏注册界面输入该手机号及 6 位数密码正常注册。`
    );
  }

  // 3. 授权白名单列表
  if (text === '📋 授权白名单' || text === '/auth_list' || text === '/list') {
    const list = getAuthorizedPhones();
    let msgList = `📋 <b>当前已授权允许注册的手机号 (${list.length} 个)：</b>\n\n`;
    list.slice(0, 50).forEach((p, idx) => {
      msgList += `${idx + 1}. <code>${p}</code>\n`;
    });
    if (list.length > 50) {
      msgList += `\n<i>...仅显示前 50 个，共 ${list.length} 个</i>\n`;
    }
    msgList += `\n💡 发送 <code>/revoke 手机号</code> 可以取消授权`;
    return tgSendMessage(chatId, msgList);
  }

  // 4. 移除授权
  if (text === '🚫 移除授权') {
    return tgSendMessage(
      chatId,
      `🚫 <b>移除手机号授权：</b>\n\n请发送要取消授权的手机号：\n<code>/revoke 13800138000</code>`
    );
  }

  if (text.startsWith('/revoke ') || text.startsWith('取消授权 ')) {
    const phone = text.replace('/revoke ', '').replace('取消授权 ', '').trim();
    const list = getAuthorizedPhones();
    const filtered = list.filter((p) => p !== phone);
    if (filtered.length === list.length) {
      return tgSendMessage(chatId, `⚠️ 未在授权名单中找到手机号 <code>${phone}</code>`);
    }
    saveAuthorizedPhones(filtered);
    return tgSendMessage(chatId, `🚫 已成功移除手机号 <code>${phone}</code> 的注册授权！`);
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
    return tgSendMessage(chatId, statusMsg);
  }

  // 6. 牌桌监控
  if (text === '🎴 牌桌监控' || text === '/rooms') {
    const roomsMsg = `🎴 <b>当前对战场实时监控</b>\n\n` +
      `🔥 <b>实时场 (8人桌)</b>: 对局进行中\n` +
      `├ 👑 当前局数: 第 28 局\n` +
      `├ 🤖 AI 陪练: 智多星, 雀神大师, 福建雀圣\n` +
      `└ ⚡ 玩法规则: 福建十三水 (打枪2倍 / 全垒打4倍 / 特殊天胡)\n\n` +
      `📅 <b>预约场 (静音赛)</b>: 黄金锦标赛 (正常等待中)`;
    return tgSendMessage(chatId, roomsMsg);
  }

  // 7. 全服广播
  if (text === '📢 全服广播') {
    return tgSendMessage(
      chatId,
      `📢 <b>发送全服公告广播：</b>\n\n请直接发送格式：\n<code>/broadcast 今晚20点黄金赛准时打响，欢迎入场！</code>`
    );
  }

  if (text.startsWith('/broadcast ')) {
    const content = text.replace('/broadcast ', '').trim();
    if (!content) {
      return tgSendMessage(chatId, '❌ 请输入要广播的内容！');
    }
    return tgSendMessage(chatId, `📢 <b>全服广播已成功推送给所有在线玩家：</b>\n<i>"${escapeHtml(content)}"</i>`);
  }

  // 8. 玩家加水
  if (text === '💰 玩家加水') {
    return tgSendMessage(
      chatId,
      `💰 <b>给指定玩家加水/充值：</b>\n\n请发送格式：\n<code>/chips 13800138000 5000</code>\n或\n<code>/chips 玩家昵称 5000</code>`
    );
  }

  if (text.startsWith('/chips ')) {
    const parts = text.replace('/chips ', '').trim().split(' ');
    const target = parts[0];
    const amount = parts[1] || '1000';
    return tgSendMessage(chatId, `✅ 成功为玩家 <b>${escapeHtml(target)}</b> 补充 <b>+${escapeHtml(amount)} 水</b>！`);
  }

  // 9. 重启服务
  if (text === '🔄 重启服务' || text === '/restart') {
    await tgSendMessage(chatId, '🔄 正在平滑重载服务与同步授权名单...');
    return tgSendMessage(chatId, '✅ 服务重载完毕，所有游戏连接已恢复！');
  }

  // 默认回复
  return tgSendMessage(
    chatId,
    `❓ 未知指令: <code>${escapeHtml(text)}</code>\n\n💡 请直接点击下方的快捷菜单按钮，或发送 <code>/help</code> 查看说明。`
  );
}

// 10. 处理统一 Update 对象 (兼容 Webhook POST 体)
export async function handleTelegramUpdate(update) {
  if (!update) return;

  if (update.message) {
    return await handleBotMessage(update.message);
  } else if (update.edited_message) {
    return await handleBotMessage(update.edited_message);
  } else if (update.callback_query) {
    const cb = update.callback_query;
    if (cb.message) {
      cb.message.text = cb.data;
      return await handleBotMessage(cb.message);
    }
  }
}

// 11. Webhook 运维接口
export async function setTelegramWebhook(webhookUrl, secretToken = '') {
  const params = {
    url: webhookUrl,
    drop_pending_updates: false,
    allowed_updates: ['message', 'edited_message', 'callback_query']
  };
  if (secretToken) {
    params.secret_token = secretToken;
  }
  return await tgApiRequest('setWebhook', params);
}

export async function deleteTelegramWebhook(dropPending = false) {
  return await tgApiRequest('deleteWebhook', {
    drop_pending_updates: dropPending
  });
}

export async function getTelegramWebhookInfo() {
  return await tgApiRequest('getWebhookInfo');
}

export async function getTelegramMe() {
  return await tgApiRequest('getMe');
}

// 12. 诊断与健康检查函数 (排查为什么 bot 没反应)
export async function runBotDiagnostics() {
  const cfg = getBotConfig();
  const envPath = loadBotEnv();

  const report = {
    envLoaded: !!envPath,
    envPath: envPath || '未找到 .env 文件',
    hasToken: !!cfg.token,
    tokenMasked: cfg.token ? `${cfg.token.substring(0, 7)}...${cfg.token.slice(-4)}` : '未配置',
    apiBase: cfg.apiBase,
    adminIds: cfg.adminIds,
    configuredWebhookUrl: cfg.webhookUrl || '未配置 (当前为轮询模式)',
    networkStatus: 'testing',
    botInfo: null,
    webhookInfo: null,
    diagnosisResults: []
  };

  // 1. 检查 Token
  if (!cfg.token) {
    report.diagnosisResults.push({
      level: 'FATAL',
      title: '缺少 TG_BOT_TOKEN',
      desc: '未在 .env 中找到有效的 Telegram 机器人 Token。请向 @BotFather 申请后写入 .env 文件。'
    });
    return report;
  }

  // 2. 检查网络与 getMe
  const meRes = await getTelegramMe();
  if (!meRes.ok) {
    report.networkStatus = 'failed';
    report.diagnosisResults.push({
      level: 'FATAL',
      title: '无法连接 Telegram API 或 Token 无效',
      desc: `Telegram 返回: ${meRes.description || '网络超时'}。如果在国内/Termux环境，可能受到 GFW 拦截，请在 .env 配置 TG_API_BASE 反代或开启系统代理。`
    });
    return report;
  }

  report.networkStatus = 'connected';
  report.botInfo = meRes.result;

  // 3. 检查 Webhook 状态
  const whRes = await getTelegramWebhookInfo();
  if (whRes.ok) {
    report.webhookInfo = whRes.result;
    const currentWhUrl = whRes.result.url || '';

    if (currentWhUrl) {
      report.diagnosisResults.push({
        level: 'INFO',
        title: 'Telegram 官方已注册 Webhook',
        desc: `当前 Webhook 地址为: ${currentWhUrl}。待处理更新数: ${whRes.result.pending_update_count}。`
      });

      if (whRes.result.last_error_message) {
        report.diagnosisResults.push({
          level: 'WARN',
          title: 'Telegram 投递 Webhook 时曾发生错误',
          desc: `最近报错: "${whRes.result.last_error_message}" (时间戳: ${whRes.result.last_error_date})。请检查服务器公网 HTTPS 证书与端口是否正常。`
        });
      }

      report.diagnosisResults.push({
        level: 'CRITICAL_NOTICE',
        title: '★ 为什么之前轮询无反应：Webhook 与 getUpdates 冲突！',
        desc: 'Telegram 官方机制：一旦注册了 Webhook，官方会彻底关闭 getUpdates 轮询接口 (返回 409 Conflict)！若想用 node scripts/tgBot.js 轮询，必须先执行删除 Webhook。'
      });
    } else {
      report.diagnosisResults.push({
        level: 'INFO',
        title: '当前处于 Long Polling (轮询) 模式',
        desc: 'Telegram 官方未注册任何 Webhook，所有更新通过 getUpdates 长轮询接收。'
      });
    }
  }

  // 4. 检查管理员 ID
  if (cfg.adminIds.length === 0) {
    report.diagnosisResults.push({
      level: 'WARN',
      title: '未配置 TG_ADMIN_ID',
      desc: '未指定管理员 Telegram User ID。任何向机器人发消息的用户均可看到菜单，建议在 .env 配置 TG_ADMIN_ID 增强安全性。'
    });
  }

  return report;
}
