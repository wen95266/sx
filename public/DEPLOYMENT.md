# 🀄 十三水（Chinese Poker）Go 语言多人在线对战系统部署手册

基于 Go 语言高性能并发架构开发的十三水多人扑克对战系统。支持 Android Termux 手机端极速部署、局域网直连联机、Cloudflare 穿透公网联机、Telegram Bot 远程运维管理、三道智能理牌、打枪/全垒打/特殊牌型结算与 53 张矢量 SVG 扑克牌实时渲染。

---

## ⚡ 1. 终极一键全自动启动（推荐）

在 Android Termux 终端中，直接粘贴运行以下一条命令，全自动完成环境检测、依赖安装、编译构建、后台运行并接入牌局：

```bash
curl -sSL https://raw.githubusercontent.com/your-username/shisanshui/main/start.sh | bash
```

或克隆仓库后运行：

```bash
git clone https://github.com/your-username/shisanshui.git
cd shisanshui
bash start.sh
```

---

## 🛠️ 2. 手动分步安装与编译

如果您希望手动分步执行：

### 第一步：更新 Termux 并安装基础依赖
```bash
pkg update -y && pkg upgrade -y
pkg install -y golang git net-tools
```

### 第二步：克隆源码并编译
```bash
git clone https://github.com/your-username/shisanshui.git
cd shisanshui
go mod tidy
go build -o server cmd/server/main.go
go build -o client cmd/client/main.go
```

### 第三步：启动后台服务
```bash
# 启动服务端 (监听 0.0.0.0:8080)
nohup ./server > server.log 2>&1 &

# 启动客户端直接进入对局
./client
```

---

## 🤖 3. Telegram 机器人远程运维管理配置

1. 在 Telegram 搜索 `@BotFather` 创建新机器人并获取 **Bot Token**（格式如 `7182938491:AAH8...`）。
2. 在 Telegram 搜索 `@userinfobot` 获取您的 **Telegram User ID**（数字格式如 `583920192`）。
3. 在启动服务端前设置环境变量：
```bash
export TG_BOT_TOKEN="您的BotToken"
export TG_ADMIN_ID="您的TelegramID"
./server
```
4. 管理员指令列表：
- `/status`：查看服务器 CPU、内存、协程与在线人数
- `/rooms`：查看当前活跃对战房间
- `/players`：查看当前在线玩家清单
- `/broadcast <内容>`：向全服所有房间广播系统公告
- `/restartroom <房号>`：重置并清理指定房间
- `/logs`：查看最新核心操作日志

---

## 🌐 4. Cloudflare 隧道公网穿透（免公网IP）

```bash
# 安装 cloudflared
pkg install -y cloudflared

# 快速免费临时隧道
cloudflared tunnel --url http://localhost:8080

# 绑定自定义域名
cloudflared tunnel login
cloudflared tunnel create shisanshui-tunnel
cloudflared tunnel route dns shisanshui-tunnel poker.yourdomain.com
cloudflared tunnel run --url http://localhost:8080 shisanshui-tunnel
```

---

## 🀄 5. 游戏规则与分道机制

- **头道（前墩）**：3 张牌。可出乌龙、对子、三条（冲三+3水）。
- **中道（中墩）**：5 张牌。中墩葫芦（+2水）、中墩铁支（+8水）、中墩同花顺（+10水）。
- **尾道（后墩）**：5 张牌。全手牌中最强一道。
- **相公（倒牌）铁律**：头道 ≤ 中道 ≤ 尾道。违规直接判负。
- **打枪（Gun Shot）**：三道全胜（3-0横扫），输赢水数翻倍（x2）。
- **全垒打（Grand Slam）**：通杀同桌全部3位对手，水数翻四倍（x4）。
- **两大板块区分**：
  - **🔥 实时场**：随时秒开，全面开放局内抽屉聊天、发光飘屏弹幕与表情互动。
  - **📅 预约场**：定时开赛、席位预订，全场静音纯净竞技（无局内聊天）。
