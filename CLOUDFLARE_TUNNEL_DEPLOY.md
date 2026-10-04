# 十三水 (Chinese Poker) · Cloudflare Tunnel 公网直连部署指南

本文档专为使用 **Cloudflare Tunnel（云洞穿透）** 将运行在 Android Termux 手机上的十三水 Go 服务端安全、稳定映射至公网的玩家与管理员编写。

**特点：**
- 🚀 **玩家打开域名就能玩**：无需安装任何客户端、无需安装 Termux、无需在同一 WiFi/热点。
- 🔒 **全链路安全加密**：Cloudflare 自动提供全球免费 SSL 证书（HTTPS + WSS 实时 WebSocket 加密）。
- 💰 **完全免费**：零服务器成本，旧手机或正在使用的手机即可做高性能服务器。

---

## 快速流程概览

```
[玩家手机/电脑 (微信/Safari/Chrome)]
              │
              ▼ HTTPS (打开 https://poker.yourdomain.com)
      [Cloudflare 全球边缘 CDN]
              │
              ▼ WSS / HTTP 隧道穿透加密流量
      [Android 手机 Termux (运行 cloudflared)]
              │
              ▼ 本地转发 (http://127.0.0.1:8080)
   [Go 十三水高性能服务端 (内置 Web 前端 + 房间对战 + TG Bot)]
```

---

## 详细步骤

### 第一步：在 Termux 中启动十三水服务端

在 Termux 终端中运行：
```bash
bash start.sh
```
或直接编译运行服务端：
```bash
go build -o server cmd/server/main.go
./server -port=8080
```
> 服务端启动后，将在本地 `http://127.0.0.1:8080` 提供完整的**HTML5 网页游戏**与 **WebSocket 联机接口**。

---

### 第二步：安装并配置 Cloudflare Tunnel (cloudflared)

在 Termux 终端安装 `cloudflared`：
```bash
pkg update && pkg install -y cloudflared
```

#### 选项 A：临时快速穿透 (Quick Tunnel，无需自备域名，秒开测速)
```bash
cloudflared tunnel --url http://127.0.0.1:8080
```
终端会输出一行类似：
`https://random-words-subdomain.trycloudflare.com`
直接复制该网址发送到群里，好友在手机浏览器打开即可进入十三水对战大厅！

#### 选项 B：绑定您的自定义专属域名 (推荐，长期稳定开黑)
1. 登录 Cloudflare 认证：
   ```bash
   cloudflared tunnel login
   ```
   点击终端生成的授权链接，在手机浏览器选择您的域名进行授权绑定。

2. 创建专属隧道：
   ```bash
   cloudflared tunnel create shisanshui-tunnel
   ```

3. 绑定二级域名 DNS 路由（例如 `poker.yourdomain.com`）：
   ```bash
   cloudflared tunnel route dns shisanshui-tunnel poker.yourdomain.com
   ```

4. 启动隧道并转发至 Termux 的 8080 端口：
   ```bash
   cloudflared tunnel run --url http://127.0.0.1:8080 shisanshui-tunnel
   ```

---

### 第三步：邀请好友对战

在微信群、QQ群、Telegram 群分享链接：
```
https://poker.yourdomain.com/?room=room_888
```

好友点击后：
1. 手机自动加载绿色赌场牌桌风格的十三水 Web 页面；
2. 自动通过 WSS 建立长连接进入房间 `room_888`；
3. 满 4 人（或房主点击添加 AI 陪练）自动发牌；
4. 点击「一键智能理牌」或自由拖放头道、中道、尾道，无相公倒牌后点击出牌；
5. 系统自动比牌，展示打枪、全垒打动画并统计水数积分！

---

### 第四步：Telegram Bot 运维监控 (可选)

若您配置了 `TG_BOT_TOKEN` 和 `TG_ADMIN_ID`，您可在 Telegram 中直接向机器人发送指令：
- `/status`：查看当前在线玩家人数、房间数、内存与 CPU 负载
- `/rooms`：查看当前正在对局的房间列表
- `/broadcast <内容>`：向所有正在打牌的玩家弹幕广播
- `/kick <玩家ID>`：强制移出违规玩家
- 每当游戏中有玩家打出【全垒打】或【至尊青龙】，Bot 会向您私聊发送高光战报！
