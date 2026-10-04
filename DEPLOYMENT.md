# 🀄 十三水 (Chinese Poker) Go 语言多人游戏 Termux 完整部署手册

> 本文档详细指导如何将本项目保存至 GitHub 仓库、在 Android Termux 手机端实现**一条命令全自动部署**、配置 **Telegram 机器人远程运维**，以及在同一 WiFi 或手机热点下与好友联机开黑。

---

## 目录
1. [环境要求与准备工作](#1-环境要求与准备工作)
2. [步骤一：创建 GitHub 仓库并推送源码](#2-步骤一创建-github-仓库并推送源码)
3. [步骤二：申请并配置 Telegram 运维机器人](#3-步骤二申请并配置-telegram-运维机器人)
4. [步骤三：在 Android Termux 中一条命令全自动部署](#4-步骤三在-android-termux-中一条命令全自动部署)
5. [步骤四：局域网联机对战配置 (三种场景)](#5-步骤四局域网联机对战配置-三种场景)
6. [步骤五：安卓后台防杀保活设置 (7x24小时稳定运行)](#6-步骤五安卓后台防杀保活设置-7x24小时稳定运行)
7. [步骤六：日常代码热更新与维护](#7-步骤六日常代码热更新与维护)
8. [常见问题解答与故障排查 (FAQ)](#8-常见问题解答与故障排查-faq)

---

## 1. 环境要求与准备工作

### 1.1 手机端准备
- **安卓系统**：Android 7.0 及以上版本手机。
- **Termux 终端**：**必须**从 [F-Droid 官方镜像](https://f-droid.org/packages/com.termux/) 下载安装（版本号 $\ge 0.118$）。
  > ⚠️ **警告**：千万不要使用 Google Play 应用商店内的 Termux（Google Play 版本早于 2020 年停止更新，包管理器已失效，无法安装 Go 1.22 编译器）。

### 1.2 电脑或已有 Git 环境（用于初次推送到 GitHub）
- 拥有一个 [GitHub 账号](https://github.com/)。
- 本地装有 `git` 工具。

---

## 2. 步骤一：创建 GitHub 仓库并推送源码

### 2.1 在 GitHub 新建仓库
1. 登录 GitHub，点击右上角 **「New repository」**。
2. 仓库名称填写：`shisanshui`。
3. 选择 **Public**（公开）或 **Private**（私有）。
4. **不要勾选** "Initialize this repository with a README"（保持空仓库）。
5. 点击 **「Create repository」**。

### 2.2 本地提交并推送到 GitHub
将本项目所有代码放入本地工作目录后，打开终端运行：

```bash
# 1. 进入项目文件夹
cd shisanshui

# 2. 初始化 Git 仓库并提交所有文件
git init
git add .
git commit -m "feat: 完善十三水 Go 多人游戏、聊天系统、TG Bot与一键脚本"
git branch -M main

# 3. 关联您刚创建的远程仓库 (将 YOUR_USERNAME 替换为您的 GitHub 用户名)
git remote add origin https://github.com/YOUR_USERNAME/shisanshui.git

# 4. 推送到 GitHub
git push -u origin main
```

> 💡 **提示**：仓库内已预置 `.github/workflows/build.yml`，每次推送到 `main` 分支时，GitHub Actions 会自动在云端交叉编译出适用于 Android ARM64、Linux 和 Windows 的二进制执行文件。

---

## 3. 步骤二：申请并配置 Telegram 运维机器人

机器人可让您随时在手机 Telegram 聊天框中输入指令，监控 Termux 状态、查看在线玩家、下发全服公告或踢人。

### 3.1 申请 Bot Token
1. 在 Telegram 搜索官方机器人 **`@BotFather`**。
2. 发送指令：`/newbot`。
3. 按照提示输入机器人的显示昵称（例如：`十三水运维助手`）和用户名（必须以 `bot` 结尾，例如：`shisanshui_admin_bot`）。
4. `@BotFather` 会返回一段 **HTTP API Token**（格式如：`7182938491:AAH8...`），请妥善保存。

### 3.2 获取管理员纯数字 User ID
1. 在 Telegram 搜索 **`@userinfobot`**。
2. 发送任意消息给它，它会立刻回复您的个人信息。
3. 记录回复中的 **`Id`**（一串纯数字，例如：`583920192`）。
   > ⚠️ **安全说明**：服务端会校验请求者的 Telegram ID，非管理员发出的指令会被拒绝。

---

## 4. 步骤三：在 Android Termux 中一条命令全自动部署

这是最核心、最简便的步骤。打开手机上的 **Termux** 应用，直接复制并粘贴以下**单条命令**：

```bash
curl -sSL https://raw.githubusercontent.com/YOUR_USERNAME/shisanshui/main/start.sh | bash
```
*(将 `YOUR_USERNAME` 替换为您第 2 步推送到 GitHub 的真实用户名)*

### 🔍 该单条命令在背后全自动执行的全部工作：
1. **自动体检**：检测手机是否安装了 `golang`、`git`、`net-tools`、`curl`，缺失时自动静默安装。
2. **自动克隆/更新**：自动从 GitHub 拉取最新源码至 `$HOME/shisanshui`。
3. **自动极速编译**：调用 Go 编译器自动编译 `./server`（服务端）与 `./client`（客户端）。
4. **后台启动**：自动查找手机当前局域网 IP，在后台静默运行 WebSocket 服务端。
5. **秒进游戏**：自动唤起 ANSI 终端彩色客户端，给您发 13 张牌并进行智能理牌推荐！

> **如果已在仓库目录中**，下次直接输入以下命令即可秒开：
> ```bash
> bash start.sh
> ```

---

## 5. 步骤四：局域网联机对战配置 (三种场景)

### 场景 A：家庭 / 宿舍 / 办公室 同一 WiFi
1. 房主在 Termux 运行 `start.sh`（或 `./server -port=8080`），屏幕会显示本机 IP（例如：`192.168.1.108`）。
2. 好友手机连接同一个 WiFi，在各自的 Termux 中输入：
   ```bash
   ./client -server="192.168.1.108:8080" -name="好友小李"
   ```
3. 即可立即进入同一个 4 人桌局开黑！

### 场景 B：户外无 WiFi 场景（手机热点开黑）
1. 房主手机开启「个人热点」。
2. 其他 3 位好友的手机连接房主的热点。
3. 房主启动服务端，此时房主手机的局域网 IP 通常为 `192.168.43.1`。
4. 好友在 Termux 运行：
   ```bash
   ./client -server="192.168.43.1:8080" -name="好友小王"
   ```

### 场景 C：异地好友远程跨公网联机
若玩家身处不同城市，可通过以下任意一种免公网 IP 方案连通：
- **方案 1：Tailscale 虚拟局域网（强烈推荐）**：所有人在手机上安装 Tailscale，加入同一 Tailnet，好友直接连入房主的 `100.x.x.x:8080`。
- **方案 2：Ngrok / FRP 端口映射**：在房主 Termux 中运行 `ngrok http 8080`，好友连入 Ngrok 提供的公网域名。

---

## 6. 步骤五：安卓后台防杀保活设置 (7x24小时稳定运行)

安卓系统会在锁屏后强行休眠后台应用，为了防止 Termux 服务端被系统中断：

1. **开启 Termux 唤醒锁 (Wake Lock)**：
   在 Termux 中输入：
   ```bash
   termux-wake-lock
   ```
   > 此时通知栏会显示 `Termux (wake lock held)` 图标，阻止系统休眠 CPU。

2. **关闭系统省电优化**：
   - 进入手机【设置】➔【应用管理】➔【Termux】。
   - 找到【耗电管理】/【电池优化】，设置为**「无限制」**或**「允许后台高耗电」**。
   - 允许【自启动】与【关联启动】。

3. **使用 tmux 保持会话**：
   ```bash
   pkg install tmux -y
   tmux new -s shisanshui
   bash start.sh
   # 按 Ctrl+B 然后按 D 即可安全脱离会话，即使关闭 Termux 界面后台服务依然长存！
   ```

---

## 7. 步骤六：日常代码热更新与维护

当您在 GitHub 仓库中更新了牌型算法或聊天功能后，手机端更新极其简单：

```bash
cd ~/shisanshui
git pull
go build -o server cmd/server/main.go
go build -o client cmd/client/main.go
echo "✓ 更新完成！"
```

---

## 8. 常见问题解答与故障排查 (FAQ)

### Q1: 运行 `pkg update` 时卡住或报错 `Repository under maintenance` 怎么办？
**解答**：Termux 默认官方源在境外，输入以下命令切换为国内清华大学镜像源即可飞速下载：
```bash
termux-change-repo
# 在弹出的图形界面中选择 Mirrors by Tsinghua（清华大学镜像源）回车确定。
```

### Q2: 提示 `bind: address already in use` (端口被占用) 怎么办？
**解答**：说明旧的服务端进程还在后台运行，执行以下命令杀掉旧进程后重新启动：
```bash
pkill -f "./server"
bash start.sh
```

### Q3: Telegram 机器人没有收到指令回复怎么办？
**解答**：
1. 检查手机 Termux 是否能正常联网访问 Telegram API（部分网络环境下连接 `api.telegram.org` 可能需要系统代理或 Clash）。
2. 确认启动服务端时传入的 `-tg-admin` 是纯数字 ID（不是 `@username` 字符）。

---
祝您与好友对战愉快！如有功能扩展需求，欢迎提交 PR 或 Issue。
