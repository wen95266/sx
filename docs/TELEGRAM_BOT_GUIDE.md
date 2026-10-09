# 🤖 十三水 Telegram 运维机器人故障排查与 Webhook 启动完整指南

> **核心摘要**：
> 如果您的 Telegram Bot 没有反应，95% 的概率是因为 **Telegram 官方的 Webhook 与 getUpdates 互斥死锁 (409 Conflict)**，或是国内/Termux **网络拦截 `api.telegram.org`**。
> 本项目已全面升级：内置 **Webhook 自动路由 (`/api/telegram/webhook`)**、**一键健康诊断 (`npm run bot:check`)** 和 **409 冲突自愈系统**。

---

## 🔍 第一部分：为什么 Telegram Bot 会没有反应？（四大高发原因全景梳理）

### 🔴 原因 1：Webhook 与 getUpdates 互斥冲突（409 Conflict 经典死锁，最高发！）
- **Telegram 官方硬性机制**：一旦该 Bot 曾注册过 Webhook（哪怕是之前在其他项目、其他电脑上用 curl 注册过），Telegram API 会**永久关闭** `getUpdates`（长轮询）接口！
- **旧代码表现**：此时运行 `npm run bot`，Telegram 返回 HTTP 409 Conflict，旧代码静默忽略了该报错，表面上显示“已启动”，但无法收到任何 Telegram 消息，Bot 彻底变成“哑巴”！
- **解决方案**：
  - **如果要用 Webhook**：配置主服务的 Webhook 路由接收即可。
  - **如果要用轮询**：运行 `npm run bot:del-webhook` 或 `npm run bot:polling`，系统会自动调用 `deleteWebhook` 解锁！

---

### 🔴 原因 2：未在服务端开启 Webhook 接收端点
- 用户如果在 Telegram 官方设置了 Webhook 地址（例如 `https://xxx.com/api/telegram/webhook`），但服务端根本没有对应的接收路由或返回了 404，Telegram 就会多次重试后暂停推送。
- **现已完善**：最新服务端 `server.js` 现已原生内置 `POST /api/telegram/webhook` 接口，Telegram 发来的指令会立即被解析并执行！

---

### 🔴 原因 3：国内网络 / Termux 无法直连 Telegram 官方服务器（GFW 阻断）
- `api.telegram.org` 在国内网络环境下通常无法直接访问。
- 如果在手机 Termux 或国内云服务器运行，直接请求 Telegram 会遇到 `ETIMEDOUT` 或 `ECONNRESET` 超时。
- **解决方案**：
  - 在 `.env` 中配置反向代理：`TG_API_BASE="https://你的CloudflareWorker反代地址"`
  - 或配置本地科学代理：`HTTPS_PROXY="http://127.0.0.1:7890"`
  - 境外 VPS / Serv00 则无需代理，可直接秒级响应。

---

### 🔴 原因 4：TG_ADMIN_ID 不匹配或缺少管理员权限
- 如果设置了 `TG_ADMIN_ID`，非管理员私聊机器人时，机器人会拦截指令。
- **解决方案**：在 Telegram 中给官方 `@userinfobot` 发送任意消息，查看您的真实数字 ID，填入 `.env`。

---

## 🚀 第二部分：如何设置 Webhook 启动 Bot？（三种极速方式）

> 💡 **为什么推荐 Webhook 模式？**
> - 在 **Serv00** 或 **Linux VPS** 上，无需在后台额外维护一个长轮询守护进程（防止被系统杀后台）。
> - Telegram 官方收到用户消息后，通过 HTTPS 主动推送到您的网站接口，零轮询开销，省内存、超极速！

### ⚡ 方式一：在 `.env` 中一行配置（最推荐，服务启动自动注册）

1. 打开项目根目录下的 `.env` 文件：
```bash
# 填入您从 @BotFather 获取的 Token
TG_BOT_TOKEN="7182938491:AAH8F5e...YOUR_TOKEN"

# 填入您的 Telegram 数字 ID
TG_ADMIN_ID="583920192"

# 填入您的公网 HTTPS 完整 Webhook 地址 (必须为 https:// 协议)
TG_WEBHOOK_URL="https://你的域名/api/telegram/webhook"
```

2. 启动（或重启）主服务：
```bash
npm start
```
控制台会输出：
```
[TG Bot] 正在向 Telegram 注册 Webhook: https://你的域名/api/telegram/webhook...
[TG Bot] ✓ Webhook 模式已就绪！Telegram 消息将直接投递至 /api/telegram/webhook
```
🎉 **此时无需执行 `npm run bot`，机器人已经完全在线！** 在 Telegram 聊天框发送 `/start` 即可看到中文菜单！

---

### ⚡ 方式二：使用项目内置的一键 CLI 命令注册 Webhook

如果您的主服务已经在后台运行，您可以在终端随时执行：

```bash
# 一键注册 Webhook
node scripts/tgBot.js --set-webhook https://你的域名/api/telegram/webhook
```

或者使用 npm 脚本：
```bash
npm run bot:webhook https://你的域名/api/telegram/webhook
```

终端会输出：
```
✅ Webhook 注册成功！Telegram 之后的更新将直接推送到该地址。
```

---

### ⚡ 方式三：使用 curl 命令行手动调用官方 API 注册

在任何能访问外网的终端执行：
```bash
curl -F "url=https://你的域名/api/telegram/webhook" https://api.telegram.org/bot<你的BOT_TOKEN>/setWebhook
```
返回 `{"ok":true,"result":true,"description":"Webhook was set"}` 即代表注册成功！

---

## 🛠️ 第三部分：如何恢复为 Long Polling（长轮询）模式？

如果您没有公网 HTTPS 域名（例如在手机 Termux 局域网内运行，或尚未配置 SSL），您可以使用长轮询模式。

**注意：启动轮询前必须先清除 Telegram 的 Webhook 锁！**

本项目提供了全自动清除并启动的命令：

```bash
# 一键自动解除 Webhook 锁，并启动轮询
npm run bot:polling
```

或者分步执行：
```bash
# 第一步：清除旧的 Webhook
npm run bot:del-webhook

# 第二步：启动长轮询
npm run bot
```

最新版 `scripts/tgBot.js` 启动时也会**自动检测并智能释放旧的 Webhook 锁**，彻底杜绝 409 Conflict 死锁！

---

## 🩺 第四部分：一键健康自检与诊断排查工具

本项目内置了全方位的诊断程序，只需一条命令即可诊断为什么机器人没有反应：

```bash
npm run bot:check
```

输出示例：
```text
🔍 ================== 十三水 Telegram Bot 全面健康诊断 ==================
📁 配置文件路径:   /root/shisanshui/.env
🔑 Bot Token:      7182938...xKq
👑 管理员 ID:      583920192
🌐 API 服务地址:   https://api.telegram.org
🌐 网络连通状态:   ✅ 畅通
🤖 机器人账号:     @my_shisanshui_bot (十三水管理员)
📡 远程 Webhook:   https://poker.example.com/api/telegram/webhook
⏳ 待处理更新数:   0

📋 诊断检查项与建议：
  ℹ️ [Telegram 官方已注册 Webhook]
     当前 Webhook 地址为: https://poker.example.com/api/telegram/webhook。
  🚨 [★ 为什么之前轮询无反应：Webhook 与 getUpdates 冲突！]
     Telegram 官方机制：一旦注册了 Webhook，官方会关闭 getUpdates 轮询接口。
========================================================================
```

此外，您还可以直接在浏览器中打开：
`https://你的域名/api/telegram/status` 或 `http://IP:8080/api/telegram/webhook`
以 JSON 格式实时查看当前机器人与 Webhook 的状态！

---

## 📋 第五部分：常用命令对照速查表

| 操作需求 | 推荐命令 | 说明 |
| :--- | :--- | :--- |
| **全面自检排查** | `npm run bot:check` | 测试 Token、网络连通性、Webhook 状态 |
| **注册 Webhook** | `node scripts/tgBot.js --set-webhook <HTTPS_URL>` | 将 Telegram 消息推送到主服务 |
| **查看 Webhook 状态** | `npm run bot:info` | 查看 Telegram 官方返回的 Webhook 详情与报错 |
| **删除 Webhook** | `npm run bot:del-webhook` | 释放 Webhook 锁，为轮询做准备 |
| **一键安全轮询** | `npm run bot:polling` | 自动清锁并启动长轮询守护程序 |
| **常规启动轮询** | `npm run bot` | 启动轮询监听（已内置自愈防冲突） |
| **启动主服务端** | `npm start` | 包含游戏对战 + Webhook 接收路由 |

---

## 📱 第六部分：手机号授权与游戏注册白名单联动机制

### ❓ 为什么 Telegram 提示授权成功，但网页注册提示“未授权”？
如果您在 Telegram 中授权成功，但游戏网页注册时依然提示未授权，主要原因通常是以下四种情况之一，现已通过代码全面优化：

1. **手机号格式差异**：
   - Telegram 中有时带国区前缀（如 `+86138...` 或 `86138...`），而网页注册输入的是 `138...`。
   - **已优化**：服务端与前端均已加入 `normalizePhoneNumber()` 自动清洗机制，无论输入带不带 `+86`、空格或横线，均会自动标准化为 11 位纯手机号匹配。

2. **前端与服务端静态缓存延迟**：
   - 如果之前在浏览器打开了注册窗口，前端可能读取的是之前的本地缓存。
   - **已优化**：
     - 在注册窗口顶部新增了 **「🔄 刷新白名单」** 按钮，点击即可实时拉取最新名单并提示授权数。
     - 每次提交注册时，前端会自动发起带有时间戳 `_t=Date.now()` 的强力抗缓存请求。
     - 请求优先走 `/api/authorized-phones` 动态接口，并同步更新 `dist/` 与 `public/` 目录下的持久化文件。

3. **快捷授权方式速查**：
   - 在 Telegram 中向机器人发送：
     - `/auth 13800138000`
     - 或直接发送 11 位手机号：`13800138000`
     - 或点击底部菜单「📱 授权手机号」按提示回复
   - 发送后机器人回复 `✅ 手机号授权成功！` 即刻生效。
   - 玩家在网页注册窗口输入该手机号及 6 位数字符密码即可秒速注册登录！

1. **第 1 步**：运行 `npm run bot:check`，查看是否有 `❌` 或 `⚠️` 报错。
2. **第 2 步**：
   - 如果决定用 **Webhook 模式**：确保您的网址是 `https://` 且能通过外网访问，在 `.env` 填入 `TG_WEBHOOK_URL="https://域名/api/telegram/webhook"` 并重启 `npm start`。
   - 如果决定用 **轮询模式**：直接执行 `npm run bot:polling`，系统会自动释放冲突锁并建立长连接。
3. **第 3 步**：打开 Telegram 向您的 Bot 发送 `/start`，底部会立即弹出常驻中文菜单！
