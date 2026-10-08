# 🀄 十三水 (Chinese Poker) 全平台多人对战系统

> 🎮 **基于现代 Web 与移动端优化的高性能十三水多人竞技系统**  
> 📦 **官方开源仓库**：`https://github.com/wen95266/sx.git`  
> 🚀 **全平台深度适配**：**Android Termux** | **Linux VPS (Ubuntu/Debian/CentOS)** | **Serv00 (FreeBSD 虚拟主机)** | **Docker 容器**

---

## 📚 三大系统部署教程矩阵 (点击直接跳转)

针对不同系统的特性与资源限制，本项目已进行代码级全方位优化（纯 ESM 架构、30MB 超轻量内存、音频流分块分片传输、Crontab/PM2 自愈），并提供三份手把手详尽教程：

| 部署平台 | 系统类型 | 核心特性与针对性优化 | 详尽教程文档 |
| :--- | :--- | :--- | :--- |
| 📱 **Android Termux** | Android (Bionic / ARM64) | 极致省电省内存 (仅 25MB RAM)、防系统休眠杀后台、WiFi/热点面对面开黑、免公网 Cloudflare 穿透 | [👉 Termux 极速部署教程](docs/DEPLOY_TERMUX.md) |
| 🐧 **Linux VPS / 云服务器** | Linux (Ubuntu / Debian / CentOS) | 生产级高并发、PM2 进程守护、原生 Systemd 服务、Docker 容器化、Nginx 反代与免费 SSL 证书 | [👉 Linux 生产级部署教程](docs/DEPLOY_LINUX.md) |
| 🌐 **Serv00 免费虚拟主机** | FreeBSD (Devil 面板) | 512MB 内存严格配额防爆、Devil 专属 TCP 端口保留、Phusion Passenger 托管、Crontab 5分钟自愈保活 | [👉 Serv00 深度部署教程](docs/DEPLOY_SERV00.md) |

---

## 🌟 项目核心特性

- **纯净现代游戏大厅**：
  - **左上角**：注册 / 登录中心（支持玩家头像切换、昵称修改、账号管理与战绩统计）。
  - **右上角**：积分管理中心（实时水数筹码展示、战绩胜率看板、低保救济与测试补水）。
  - **主体两大板块**：**🔥 实时场**（随时秒速开黑、局内抽屉文字/语音/表情聊天与飘屏弹幕）与 **📅 预约场**（定时赛事、席位预订、全场静音纯净竞技）。
- **1:1 移动端深度优化牌桌**：
  - 水平 8 人玩家坐席条（当前玩家高亮标识与战力展示）。
  - 前墩（3张）、中墩（5张）、后墩（5张）叠放展示，实时显示牌型名称（如 `[对子 (一对)] 对 8`、`[同花 (五张同色)]`、`[葫芦 (三带二)]`）。
  - **✨ 变换牌型**：一键循环套用 AI 智能最优理牌组合方案。
  - **✓ 提交牌型**：分墩步进式比牌结算（打枪翻倍、全垒打通杀、特殊天胡牌型直接胜利）。
- **高兼容性与超轻量服务端**：
  - 启动仅占用 **~30MB 运行内存**，不仅能在高性能 Linux 云服务器上高并发运行，更完美适配 Android 手机 Termux 与 Serv00 512MB 内存配额环境！

---

## ⚡ 极速起步指南 (通用)

### 1. 克隆代码与安装依赖
```bash
git clone https://github.com/wen95266/sx.git
cd sx
npm install
```

### 2. 生产构建与启动 (推荐)
```bash
# 1. 编译静态资源 (一次构建，长期运行)
npm run build

# 2. 启动生产服务端 (超轻量、低内存、低功耗)
npm start
```
服务将在 `http://0.0.0.0:8080` 启动！

> 💡 **本地调试热重载**：执行 `npm run dev:8080` 即可启动 Vite 实时开发服务。  
> 💡 **低内存环境 (Serv00)**：执行 `npm run build:lowmem` 与 `npm run start:lowmem`。

---

## 🤖 配置 .env 与 Telegram Bot 管理员运维

在项目根目录创建 `.env` 文件后，即可通过 Telegram Bot 随时随地在手机 Telegram 上远程监控服务器状态、查询对局与广播公告！

```bash
cat << 'EOF' > .env
# Telegram Bot Token
TG_BOT_TOKEN="你的Telegram_Bot_Token"

# 管理员 Telegram 数字 User ID
TG_ADMIN_ID="你的Telegram_User_ID"

# 游戏服务端口 (默认为 8080)
PORT=8080
EOF
```

启动 Telegram 运维机器人：
```bash
npm run bot
```

### 📱 Telegram 管理员中文键盘功能：
- **📱 授权手机号**：直接输入手机号（如 `/auth 13800138000`）为好友开通注册资格。
- **📋 授权白名单**：查看当前所有已授权玩家。
- **🚫 移除授权**：取消违规玩家的授权。
- **📊 服务器状态**：实时监控服务器平台（自动识别 Termux / Linux / Serv00）、内存占用、开机时长与访问地址。
- **🎴 牌桌监控**：监控当前对局房间与牌局进度。
- **📢 全服广播**：向全服在线玩家发送系统飘屏弹幕。
- **💰 玩家加水**：远程为指定玩家充值筹码。
- **🔄 重启服务**：远程平滑重载游戏状态。

---

## 🛠️ 常用维护命令速查

| 操作场景 | 执行命令 | 适用环境 |
| :--- | :--- | :--- |
| **生产极速启动 (推荐)** | `npm start` | 全部 (Termux / Linux / Serv00) |
| **低内存极速启动** | `npm run start:lowmem` | Serv00 (512MB配额) / 低配机型 |
| **低内存资源构建** | `npm run build:lowmem` | Serv00 / 树莓派 |
| **开发热重载启动 (8080)** | `npm run dev:8080` | 开发测试 |
| **PM2 生产守护启动** | `pm2 start ecosystem.config.cjs` | Linux VPS / Serv00 |
| **Docker 容器化启动** | `docker compose up -d --build` | Linux (Docker) |
| **启动 Telegram 运维机器人** | `npm run bot` | 全部 |
| **拉取 GitHub 最新代码** | `git pull` | 全部 |
| **代码语法校验** | `npm run lint` | 全部 |

---

## 📄 许可协议

本项目遵循 MIT 开源协议，欢迎提交 Issue 与 Pull Request 共同完善！
