# 🀄 十三水 (Chinese Poker) 多人对战系统

> 🎮 **基于现代 Web 与移动端优化的高性能十三水多人竞技系统**  
> 📦 **官方开源仓库**：`https://github.com/wen95266/sx.git`  
> 📱 **支持运行环境**：Android Termux / 电脑本地 / VPS 云服务器 / 微信内置浏览器 / 移动端 Chrome

---

## 📖 目录
1. [项目特性](#-项目特性)
2. [Termux 极速运行与测试流程 (手把手教程)](#-termux-极速运行与测试流程-手把手教程)
3. [配置 .env 与 Telegram Bot 管理员运维](#-配置-env-与-telegram-bot-管理员运维)
4. [局域网 WiFi / 热点多设备联机测试](#-局域网-wifi--热点多设备联机测试)
5. [外网异地远程联机 (免费 Cloudflare 穿透)](#-外网异地远程联机-免费-cloudflare-穿透)
6. [后台持久运行与防休眠设置](#-后台持久运行与防休眠设置)
7. [常用维护命令速查](#-常用维护命令速查)
8. [常见问题与故障排查 (FAQ)](#-常见问题与故障排查-faq)

---

## 🌟 项目特性

- **纯净现代游戏大厅**：
  - **左上角**：注册 / 登录中心（支持玩家头像切换、昵称修改、账号管理与战绩统计）。
  - **右上角**：积分管理中心（实时水数筹码展示、战绩胜率看板、低保救济与测试补水）。
  - **主体两大板块**：**🔥 实时场**（随时秒速开黑、局内抽屉文字/语音/表情聊天与飘屏弹幕）与 **📅 预约场**（定时赛事、席位预订、全场静音纯净竞技）。
- **1:1 移动端深度优化牌桌**：
  - 水平 8 人玩家坐席条（当前玩家高亮标识与战力展示）。
  - 前墩（3张）、中墩（5张）、后墩（5张）叠放展示，实时显示牌型名称（如 `[对子 (一对)] 对 8`、`[同花 (五张同色)]`、`[葫芦 (三带二)]`）。
  - **✨ 变换牌型**：一键循环套用 AI 智能最优理牌组合方案。
  - **✓ 提交牌型**：分墩步进式比牌结算（打枪翻倍、全垒打通杀、特殊天胡牌型直接胜利）。

---

## 🚀 Termux 极速运行与测试流程 (手把手教程)

如果您已经在 Termux 中拉取了 `https://github.com/wen95266/sx.git` 仓库，请按以下步骤操作：

### 步骤 1：确认并安装基础依赖环境

打开手机上的 **Termux** 终端，运行以下命令安装 Node.js LTS 与 Git：

```bash
pkg update -y && pkg install -y git nodejs-lts
```

---

### 步骤 2：进入已拉取的项目目录

```bash
cd ~/sx
git pull
```

---

### 步骤 3：安装项目所需依赖

```bash
npm install
```

---

### 步骤 4：启动本地测试开发服务 (8080端口)

```bash
npm run dev:8080
```

> 💡 如果想启动 3000 端口，可执行 `npm run dev`。

---

### 步骤 5：在手机浏览器中打开并开始测试对战

打开手机自带的 **Chrome**、**Edge** 或任意手机浏览器，访问：
```text
http://localhost:8080
```
或您的 **Cloudflare 域名** 即可开始体验！

---

## 🤖 配置 .env 与 Telegram Bot 管理员运维

在项目根目录创建 `.env` 文件后，即可通过 Telegram Bot 随时随地在手机 Telegram 上远程监控服务器状态、查询对局与广播公告！

### 步骤 1：获取 Telegram Bot Token 与 管理员 ID

1. **获取 Bot Token**：
   - 在 Telegram 中搜索关注官方 **`@BotFather`**。
   - 发送 `/newbot`，按照提示为机器人取名（例如 `MyShisanshuiBot`）。
   - 创建成功后，BotFather 会发给您一串 **HTTP API Token**（例如 `7123456789:AAHKl...`）。

2. **获取您的数字 User ID**：
   - 在 Telegram 中搜索并向 **`@userinfobot`** 发送任意消息。
   - 机器人会回复您的专属 **Id**（例如 `987654321`）。

---

### 步骤 2：在项目根目录创建并写入 `.env` 文件

在 Termux 终端中依次执行以下命令：

```bash
cd ~/sx

# 一键创建 .env 并写入配置（请将下面的 Token 与 ID 替换为您自己的）
cat << 'EOF' > .env
# Telegram Bot Token
TG_BOT_TOKEN="你的Telegram_Bot_Token"

# 管理员 Telegram 数字 User ID
TG_ADMIN_ID="你的Telegram_User_ID"

# 游戏服务端口
PORT=8080
EOF
```

> 💡 也可使用 nano 编辑器进行修改：`nano .env`（按 `Ctrl + O` 保存，`Ctrl + X` 退出）。

---

### 步骤 3：启动 Telegram 运维机器人

在 Termux 中运行：

```bash
npm run bot
```

启动成功后，您的 Telegram 就会立刻收到机器人发来的 **「十三水游戏服务·上线通知」**！

#### 📱 支持的 Telegram 管理员指令：
- `/help` - 查看所有管理员指令菜单
- `/status` - 查看服务器实时运行状态、内存占用、开机时长与局域网 IP
- `/rooms` - 查看当前在线对战场与活跃玩家席位
- `/broadcast <公告内容>` - 向全服在线玩家发送系统飘屏弹幕广播
- `/ip` - 获取当前手机对战服务访问地址
- `/restart` - 远程平滑重载游戏服务

---

## 📶 局域网 WiFi / 热点多设备联机测试

如果您想让同在一个 WiFi（或连接您手机热点）的朋友一起加入测试：

1. **查看手机的局域网 IP**：
   ```bash
   ifconfig | grep "inet "
   ```
2. **好友加入游戏**：
   好友在浏览器中输入：`http://你的手机局域网IP:8080` 即可面对面联机开黑！

---

## 🌐 外网异地远程联机 (免费 Cloudflare 穿透)

```bash
pkg install -y cloudflared
cloudflared tunnel --url http://localhost:8080
```
把终端输出的 `https://xxxx.trycloudflare.com` 发给好友即可异地秒开！

---

## 🔋 后台持久运行与防休眠设置

1. **开启 Termux 唤醒锁**：
   ```bash
   termux-wake-lock
   ```
2. **手机系统设置**：
   - 进入系统「设置」->「应用管理」->「Termux」->「省电策略」设置为「无限制 / 允许后台高耗电」。

---

## 🛠️ 常用维护命令速查

| 操作 | 执行命令 |
| :--- | :--- |
| **启动 8080 端口游戏服务** | `npm run dev:8080` |
| **启动 3000 端口游戏服务** | `npm run dev` |
| **启动 Telegram 运维机器人** | `npm run bot` |
| **生产环境编译打包** | `npm run build` |
| **代码语法检查校验** | `npm run lint` |
| **拉取 GitHub 最新代码** | `git pull` |
| **开启防睡眠锁** | `termux-wake-lock` |
