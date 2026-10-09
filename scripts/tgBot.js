#!/usr/bin/env node
/**
 * 🀄 十三水 Telegram 运维机器人启动与管理工具
 *
 * 支持用法：
 * 1. 默认启动长轮询：  node scripts/tgBot.js
 * 2. 自动诊断排查：    node scripts/tgBot.js --check
 * 3. 注册 Webhook：    node scripts/tgBot.js --set-webhook https://your-domain.com/api/telegram/webhook
 * 4. 删除 Webhook：    node scripts/tgBot.js --del-webhook
 * 5. 查看 Webhook 状态: node scripts/tgBot.js --info
 */

import {
  getBotConfig,
  getAuthorizedPhones,
  getServerStats,
  ADMIN_KEYBOARD,
  tgApiRequest,
  tgSendMessage,
  handleBotMessage,
  setTelegramWebhook,
  deleteTelegramWebhook,
  getTelegramWebhookInfo,
  getTelegramMe,
  runBotDiagnostics
} from './tgBotCore.js';

const args = process.argv.slice(2);
const command = args[0] || '';

async function main() {
  const config = getBotConfig();

  // 1. 诊断命令 --check
  if (command === '--check' || command === 'check') {
    console.log('\n🔍 ================== 十三水 Telegram Bot 全面健康诊断 ==================');
    const report = await runBotDiagnostics();
    console.log(`📁 配置文件路径:   ${report.envPath}`);
    console.log(`🔑 Bot Token:      ${report.tokenMasked}`);
    console.log(`👑 管理员 ID:      ${report.adminIds.length > 0 ? report.adminIds.join(', ') : '未限制 (所有私聊均可接收)'}`);
    console.log(`🌐 API 服务地址:   ${report.apiBase}`);
    console.log(`🌐 网络连通状态:   ${report.networkStatus === 'connected' ? '✅ 畅通' : '❌ 无法连接'}`);

    if (report.botInfo) {
      console.log(`🤖 机器人账号:     @${report.botInfo.username} (${report.botInfo.first_name})`);
    }

    if (report.webhookInfo) {
      console.log(`📡 远程 Webhook:   ${report.webhookInfo.url || '未注册 (当前允许轮询)'}`);
      console.log(`⏳ 待处理更新数:   ${report.webhookInfo.pending_update_count}`);
      if (report.webhookInfo.last_error_message) {
        console.log(`⚠️ 上次投递报错:   ${report.webhookInfo.last_error_message}`);
      }
    }

    console.log('\n📋 诊断检查项与建议：');
    report.diagnosisResults.forEach((r, idx) => {
      const icon = r.level === 'FATAL' ? '❌' : r.level === 'WARN' ? '⚠️' : r.level === 'CRITICAL_NOTICE' ? '🚨' : 'ℹ️';
      console.log(`  ${icon} [${r.title}]`);
      console.log(`     ${r.desc}`);
    });
    console.log('========================================================================\n');
    process.exit(0);
  }

  // 2. 查看 Webhook 状态 --info
  if (command === '--info' || command === 'info') {
    if (!config.token) {
      console.error('❌ 未在 .env 中找到 TG_BOT_TOKEN');
      process.exit(1);
    }
    const res = await getTelegramWebhookInfo();
    console.log('\n📡 当前 Telegram 官方 Webhook 详情：');
    console.dir(res, { depth: null, colors: true });
    process.exit(0);
  }

  // 3. 删除 Webhook --del-webhook
  if (command === '--del-webhook' || command === 'del-webhook') {
    if (!config.token) {
      console.error('❌ 未在 .env 中找到 TG_BOT_TOKEN');
      process.exit(1);
    }
    console.log('🔄 正在请求 Telegram API 删除 Webhook (解除轮询锁定)...');
    const res = await deleteTelegramWebhook(true);
    if (res.ok) {
      console.log('✅ Webhook 已成功清除！现在可以正常使用 node scripts/tgBot.js 进行轮询了。');
    } else {
      console.error('❌ 清除 Webhook 失败:', res.description || res);
    }
    process.exit(0);
  }

  // 4. 设置 Webhook --set-webhook
  if (command === '--set-webhook' || command === 'set-webhook') {
    const targetUrl = args[1] || config.webhookUrl;
    if (!targetUrl) {
      console.error('❌ 请提供 Webhook URL！\n例如：node scripts/tgBot.js --set-webhook https://你的公网域名/api/telegram/webhook');
      process.exit(1);
    }
    if (!targetUrl.startsWith('https://')) {
      console.warn('⚠️ 警告：Telegram 官方强制要求 Webhook URL 必须是 https:// 协议 (支持有效 SSL 证书)！');
    }
    console.log(`🔄 正在向 Telegram 注册 Webhook 地址: ${targetUrl} ...`);
    const res = await setTelegramWebhook(targetUrl, config.webhookSecret);
    if (res.ok) {
      console.log('✅ Webhook 注册成功！Telegram 之后的更新将直接推送到：', targetUrl);
      console.log('💡 提示：在 Webhook 模式下无需保持后台运行 node scripts/tgBot.js，主服务端 (node server.js) 会直接处理！');
    } else {
      console.error('❌ 注册 Webhook 失败:', res.description || res);
    }
    process.exit(0);
  }

  // 5. 默认行为：长轮询模式 (带冲突自愈机制)
  if (!config.token) {
    console.error('\n❌ 未在 .env 文件中检测到 TG_BOT_TOKEN！');
    console.log('💡 请在项目根目录下创建 .env 文件，并填入：');
    console.log('TG_BOT_TOKEN="你的Telegram机器人Token"');
    console.log('TG_ADMIN_ID="你的Telegram数字用户ID"\n');
    console.log('或者运行全面健康自检：node scripts/tgBot.js --check\n');
    process.exit(1);
  }

  console.log(`\n======================================================`);
  console.log(`🀄 十三水 Telegram 运维机器人正在启动...`);
  console.log(`🔑 机器人 Token: ${config.token.substring(0, 8)}******`);
  console.log(`👑 管理员 ID: ${config.adminIds.length > 0 ? config.adminIds.join(', ') : '未限制 (所有私聊均可接收通知)'}`);
  console.log(`🌐 连接端点: ${config.apiBase}`);
  console.log(`======================================================\n`);

  // 第一步：自检连通性
  process.stdout.write('🔍 正在验证 Token 与 Telegram 连通性... ');
  const meRes = await getTelegramMe();
  if (!meRes.ok) {
    console.log('❌ 失败！');
    console.error(`\n[连接异常] Telegram 返回: ${meRes.description}`);
    console.log('\n💡 排查建议：');
    console.log('1. 如果在国内或 Termux，请配置 .env 的 TG_API_BASE 使用反代，或开启全局代理。');
    console.log('2. 运行自检工具定位根因: node scripts/tgBot.js --check\n');
    process.exit(1);
  }
  console.log(`✅ 成功！机器人账号: @${meRes.result.username}`);

  // 第二步：检查并清除已存在的 Webhook，防止 409 Conflict 死锁
  process.stdout.write('🔍 正在检查 Telegram Webhook 锁... ');
  const whInfo = await getTelegramWebhookInfo();
  if (whInfo.ok && whInfo.result && whInfo.result.url) {
    console.log(`⚠️ 检测到旧 Webhook (${whInfo.result.url})！`);
    console.log('🚨 Telegram 机制：存在 Webhook 时禁止轮询。正在自动清除 Webhook 锁...');
    const delRes = await deleteTelegramWebhook(false);
    if (delRes.ok) {
      console.log('✅ Webhook 锁已成功自动释放！已切换回原生轮询模式。');
    } else {
      console.warn('⚠️ 自动释放 Webhook 锁失败:', delRes.description);
    }
  } else {
    console.log('✅ 正常 (未受 Webhook 阻断)。');
  }

  // 第三步：向管理员发送启动通知
  if (config.adminIds.length > 0) {
    const stats = getServerStats();
    const initMsg = `🀄 <b>十三水游戏服务·控制台已连接 (轮询模式)</b>\n\n` +
      `📅 <b>时间</b>: ${stats.time}\n` +
      `💻 <b>环境</b>: ${stats.platform}\n` +
      `📶 <b>游戏地址</b>: <code>http://${stats.localIp}:${stats.port}</code>\n` +
      `💾 <b>运行内存</b>: 剩余 ${stats.memFree} MB / 共 ${stats.memTotal} MB\n` +
      `📱 <b>注册限制</b>: 只有 Bot 授权的手机号允许注册！\n\n` +
      `👇 <b>请直接点击下方中文键盘菜单进行快速操作：</b>`;

    for (const adminId of config.adminIds) {
      tgSendMessage(adminId, initMsg).catch(() => {});
    }
  }

  console.log('\n🟢 [TG Bot] 轮询监听已开启！在 Telegram 中向 Bot 发送消息或点击菜单即可实时响应。\n');

  // 第四步：进入长轮询循环 (带详细错误日志与自愈)
  let lastUpdateId = 0;
  let consecutiveErrors = 0;

  while (true) {
    try {
      const res = await tgApiRequest('getUpdates', {
        offset: lastUpdateId + 1,
        timeout: 30
      });

      if (res && res.ok && Array.isArray(res.result)) {
        consecutiveErrors = 0;
        for (const update of res.result) {
          lastUpdateId = update.update_id;
          if (update.message) {
            await handleBotMessage(update.message);
          } else if (update.edited_message) {
            await handleBotMessage(update.edited_message);
          } else if (update.callback_query && update.callback_query.message) {
            update.callback_query.message.text = update.callback_query.data;
            await handleBotMessage(update.callback_query.message);
          }
        }
      } else {
        consecutiveErrors++;
        const desc = res?.description || '未知错误';
        if (desc.includes('Conflict: can\'t use getUpdates')) {
          console.error('\n🚨 [409 Conflict] 发现 Webhook 被其他服务重新注册，导致轮询被 Telegram 挂起！');
          console.log('🔄 正在尝试重新解锁...');
          await deleteTelegramWebhook(false);
        } else {
          console.warn(`[TG Bot 轮询警告] (${consecutiveErrors}次) ${desc}`);
        }
        await new Promise((r) => setTimeout(r, Math.min(consecutiveErrors * 2000, 15000)));
      }
    } catch (e) {
      consecutiveErrors++;
      console.error(`[TG Bot 轮询异常] ${e.message}`);
      await new Promise((r) => setTimeout(r, Math.min(consecutiveErrors * 2000, 15000)));
    }
  }
}

main().catch((err) => {
  console.error('[TG Bot] 致命错误退出:', err);
  process.exit(1);
});
