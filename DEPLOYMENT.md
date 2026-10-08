# 🀄 十三水 (Chinese Poker) 多平台部署总览手册

> 📦 **官方开源仓库**：`https://github.com/wen95266/sx.git`  
> 💻 **支持系统**：Android Termux / Linux 云服务器 (Ubuntu/Debian/CentOS) / Serv00 (FreeBSD 虚拟主机)

---

## 🎯 快速导航：不同系统部署详细教程

为了让您在不同的硬件与系统环境下获得最佳体验，我们针对各系统的特性和资源限制（如 Serv00 的 512MB 内存、Termux 的安卓后台休眠机制、Linux VPS 的生产级进程守护）编写了专门的手把手教程：

1. **[📱 Android Termux 极速部署与防休眠保活教程](docs/DEPLOY_TERMUX.md)**
   - 包含：Termux 安装、局域网面对面开黑、Cloudflare 免费公网穿透、`termux-wake-lock` 防杀设置。
2. **[🐧 Linux VPS / 云服务器生产级部署教程](docs/DEPLOY_LINUX.md)**
   - 包含：PM2 进程守护、原生 Systemd 服务、Docker & Docker Compose 一键部署、Nginx 反向代理与 SSL 证书。
3. **[🌐 Serv00 (FreeBSD) 免费虚拟主机深度部署教程](docs/DEPLOY_SERV00.md)**
   - 包含：`devil binexec on` 开启后台权限、Devil 专属 TCP 端口保留、512MB 内存防爆优化、Crontab 5分钟自愈保活。

---

## ⚡ 统一极速起步命令 (跨平台通用)

无论您在哪种系统下，拉取代码后的标准命令完全一致：

```bash
# 1. 进入项目根目录
git clone https://github.com/wen95266/sx.git
cd sx

# 2. 安装依赖
npm install

# 3. 生产打包并启动 (内存占用仅 30MB)
npm run build
npm start
```

默认将在 `http://0.0.0.0:8080` 启动游戏服务。

---

## 🤖 Telegram 运维机器人配合

支持在 `.env` 中配置 `TG_BOT_TOKEN` 与 `TG_ADMIN_ID`：
```bash
npm run bot
```
机器人支持中文快捷键盘菜单，可实时监控当前服务器平台（自动识别 Termux / Linux / Serv00）、内存占用，并支持在线管理玩家注册白名单与充值水数。
