# 🀄 十三水（Chinese Poker）全平台多人对战系统部署与运维手册

> 📦 **官方开源仓库**：`https://github.com/wen95266/sx.git`  
> 💻 **支持系统**：Android Termux | Linux VPS (Ubuntu/Debian/CentOS) | Serv00 (FreeBSD 虚拟主机) | Docker 容器

---

## ⚡ 1. 跨平台统一极速起步

在 Android Termux 或 Linux 服务器终端中，执行以下标准命令快速启动：

```bash
# 1. 克隆源码并进入目录
git clone https://github.com/wen95266/sx.git
cd sx

# 2. 安装依赖包
npm install

# 3. 生产打包并启动 (超轻量设计，运行仅占 25MB~30MB 内存)
npm run build
npm start
```
服务将在 `http://0.0.0.0:8080` 启动，浏览器打开即可畅玩！

---

## 🔄 2. 核心：代码更新、删除旧文件与重新编译覆盖教程

当远程仓库更新后，为了杜绝旧的静态资源缓存残留、哈希错乱或运行错误，**必须在拉取更新后删除旧编译文件重新编译覆盖**：

### 📱 Android Termux 手机端更新规范
```bash
cd ~/sx

# 1. 杀掉旧服务释放端口
pkill -f node

# 2. 拉取最新代码并安装新依赖
git pull origin main && npm install

# 3. 彻底删除旧编译产物与 Vite 缓存 (核心)
rm -rf dist node_modules/.vite   # 或运行 npm run clean

# 4. 重新编译生成全新静态文件覆盖
npm run build

# 5. 重新启动服务
npm start

# 💡 Termux 一键连招更新命令：
cd ~/sx && pkill -f node; git pull && rm -rf dist && npm run build && npm start
```

### 🐧 Linux VPS 云服务器 (PM2 / Systemd / Docker)
```bash
cd /var/www/shisanshui

# 1. 拉取仓库最新代码
git pull origin main && npm install

# 2. 删除旧编译文件夹
rm -rf dist node_modules/.vite   # 或运行 npm run clean

# 3. 重新编译覆盖
npm run build

# 4. 平滑重载进程 (零停机):
pm2 reload shisanshui
# 若使用 Systemd: sudo systemctl restart shisanshui
# 若使用 Docker: docker compose build --no-cache && docker compose up -d

# 💡 Linux PM2 一键连招命令：
git pull && rm -rf dist && npm run build && pm2 reload shisanshui
```

### 🌐 Serv00 (FreeBSD 虚拟主机，512MB 内存严格配额)
```bash
cd ~/sx

# 1. 杀掉旧 node 进程腾出 512MB 编译器内存空间
killall -9 node

# 2. 拉取最新代码
git pull origin main

# 3. 删除旧编译文件与缓存
rm -rf dist node_modules/.vite   # 或运行 npm run clean

# 4. 使用 Serv00 专用低内存模式编译覆盖 (限制 384MB 避免被 kill)
npm run build:lowmem

# 5. 后台重新拉起服务
nohup npm run start:lowmem > server.log 2>&1 &
# 若使用 Passenger 域名托管: devil www restart 你的域名.serv00.net

# 💡 Serv00 一键连招命令：
cd ~/sx && killall -9 node; git pull && rm -rf dist && npm run build:lowmem && nohup npm run start:lowmem > server.log 2>&1 &
```

---

## 🤖 3. Telegram 机器人远程运维管理配置

1. 在 Telegram 搜索 `@BotFather` 获取 **Bot Token**。
2. 搜索 `@userinfobot` 获取您的 **Telegram User ID**。
3. 在项目根目录 `.env` 填入配置：
```bash
cat << 'EOF' > .env
PORT=8080
TG_BOT_TOKEN="你的Telegram_Bot_Token"
TG_ADMIN_ID="你的Telegram_User_ID"
EOF
```
4. 启动机器人运维：
```bash
npm run bot
```
管理指令包含：`/status`（查看系统平台与内存）、`/auth <手机号>`（授权玩家白名单）、`/broadcast <公告>`（全服广播飘屏弹幕）、`/rooms`（监控房间）。

---

## 🌐 4. Cloudflare 隧道公网穿透（免公网IP）

```bash
# Termux 安装 cloudflared
pkg install -y cloudflared

# 一键创建免费 HTTPS 临时隧道
cloudflared tunnel --url http://127.0.0.1:8080
```
将终端输出的 `https://xxxx.trycloudflare.com` 链接分享给好友即可跨网络联机对战！

---

## 🀄 5. 游戏规则与分道机制

- **头道（前墩）**：3 张牌。可出乌龙、对子、三条（冲三+3水）。
- **中道（中墩）**：5 张牌。中墩葫芦（+2水）、中墩铁支（+8水）、中墩同花顺（+10水）。
- **尾道（后墩）**：5 张牌。全手牌中最强一道。
- **相公（倒牌）铁律**：头道 ≤ 中道 ≤ 尾道。违规直接判负。
- **打枪（Gun Shot）**：三道全胜（3-0横扫），输赢水数翻倍（x2）。
- **全垒打（Grand Slam）**：通杀同桌全部3位对手，水数翻四倍（x4）。
- **两大板块**：
  - **🔥 实时场**：随时秒开，支持局内抽屉语音、文字、表情与飘屏弹幕。
  - **📅 预约场**：定时开赛、席位预订、全场静音纯净竞技。

