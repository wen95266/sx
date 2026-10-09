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

## 🔄 核心：拉取仓库更新、删除旧文件与重新编译覆盖教程

当远程 GitHub 仓库提交了新牌型逻辑、多人语音优化、界面更新或修复时，在各系统运行环境下的更新与重新编译操作如下。

### 为什么必须删除旧文件重新编译？
1. **防止旧哈希缓存残留**：Vite 编译会在 `dist/assets/` 下生成带 hash 值的 JS/CSS 文件。如果不删除旧 `dist`，旧文件会一直堆积，且服务端或 Service Worker 可能会继续引用旧静态文件。
2. **清理本地编译缓存**：删除 `dist` 与 `node_modules/.vite` 可以确保从全新源码编译，避免增量编译产生的死代码或未定义变量。
3. **低内存设备防爆内存**：在 Serv00 等有限内存环境，彻底清理旧产物后使用 `npm run build:lowmem` 可确保稳定覆盖。

---

### 各平台一键更新与重编译命令速查表

#### 📱 1. Android Termux 手机端
```bash
# 进入目录
cd ~/sx

# 步骤说明：杀掉旧进程 -> 拉取最新代码 -> 删除旧文件与缓存 -> 重新编译覆盖 -> 重新启动
pkill -f node
git pull origin main
npm install
rm -rf dist node_modules/.vite   # 或执行 npm run clean
npm run build                    # 重新编译生成全新 dist
npm start                        # 重新启动服务

# 💡 Termux 一键连招命令：
cd ~/sx && pkill -f node; git pull && rm -rf dist && npm run build && npm start
```

#### 🐧 2. Linux VPS / 云服务器 (PM2 / Systemd / Docker)
```bash
cd /var/www/shisanshui

# ① 拉取最新代码与更新依赖
git pull origin main && npm install

# ② 彻底删除旧编译产物与 Vite 缓存
rm -rf dist node_modules/.vite   # 或执行 npm run clean

# ③ 重新编译静态文件并覆盖
npm run build

# ④ 服务平滑重启 (根据您的守护方式执行):
# 如果使用 PM2 (推荐):
pm2 reload shisanshui
# 如果使用 Systemd:
sudo systemctl restart shisanshui
# 如果使用 Docker:
docker compose build --no-cache && docker compose up -d

# 💡 PM2 常用一键连招命令：
git pull && rm -rf dist && npm run build && pm2 reload shisanshui
```

#### 🌐 3. Serv00 (FreeBSD 虚拟主机，512MB 内存严格配额)
```bash
cd ~/sx

# ① 必须先杀掉旧 Node 进程，为编译器腾出 512MB 内存空间
killall -9 node

# ② 拉取最新代码
git pull origin main

# ③ 删除旧编译产物与缓存
rm -rf dist node_modules/.vite   # 或执行 npm run clean

# ④ 使用 Serv00 专属低内存模式编译覆盖 (将内存压在 384MB 以内，防止被 kill)
npm run build:lowmem

# ⑤ 重新拉起服务:
# 独立端口模式：
nohup npm run start:lowmem > server.log 2>&1 &
# Passenger 域名模式：
devil www restart 你的域名.serv00.net

# 💡 Serv00 一键连招命令：
cd ~/sx && killall -9 node; git pull && rm -rf dist && npm run build:lowmem && nohup npm run start:lowmem > server.log 2>&1 &
```

---

## 🤖 Telegram 运维机器人配合

支持在 `.env` 中配置 `TG_BOT_TOKEN` 与 `TG_ADMIN_ID`：
```bash
npm run bot
```
机器人支持中文快捷键盘菜单，可实时监控当前服务器平台（自动识别 Termux / Linux / Serv00）、内存占用，并支持在线管理玩家注册白名单与充值水数。
