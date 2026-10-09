# 🐧 Linux VPS / 云服务器生产级部署与运维教程

> 本教程专为在 Linux 云服务器（Ubuntu、Debian、CentOS、AlmaLinux、Alpine 等）上部署《十三水》多人对战系统而编写。涵盖 **PM2 进程守护**、**Systemd 系统服务**、**Docker 容器化** 以及 **Nginx 反向代理 + SSL 证书** 的全流程生产实践。

---

## 📌 Linux 服务器特性与架构优势

| 特性项 | 说明与最佳实践 |
| :--- | :--- |
| **独占高性能计算与网络** | 拥有独立公网 IPv4/IPv6、高带宽与多核性能，适合多房间、多玩家高并发对战 |
| **Systemd / PM2 进程守护** | 支持服务器宕机重启自愈、奔溃自动拉起、内存超标自愈重启 |
| **标准特权端口与 Nginx 整合** | 可通过 Nginx 反向代理监听标准 `80` (HTTP) 与 `443` (HTTPS)，提供全链路 WSS 加密 |
| **安全防火墙隔离** | 配合 UFW 或安全组仅对外开放 80、443 与 SSH 端口，将 Node.js 游戏服务收敛在内网 |

---

## 🛠️ 第一部分：环境准备与源码拉取

以 **Ubuntu / Debian** 为例（CentOS 使用 `yum` 或 `dnf`）：

### 1. 更新系统并安装 Node.js 20+ 与 Git
```bash
# 更新软件包列表
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 20 LTS (NodeSource 官方源)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git build-essential

# 检查版本
node -v   # v20.x 或更高
npm -v
```

### 2. 克隆仓库与安装依赖
```bash
# 推荐将项目放在 /var/www 或用户根目录
cd /var/www
git clone https://github.com/wen95266/sx.git shisanshui
cd shisanshui

# 安装依赖
npm install

# 生产环境编译前端资源
npm run build
```

### 3. 配置生产环境变量
在项目根目录创建 `.env` 文件：
```bash
cat << 'EOF' > .env
# 游戏服务端口 (如果使用 Nginx 转发，保持 8080 即可)
PORT=8080
HOST=0.0.0.0

# Telegram 运维机器人 (可选)
TG_BOT_TOKEN="你的Telegram_Bot_Token"
TG_ADMIN_ID="你的Telegram_User_ID"
# Webhook 模式 (推荐配合 Nginx HTTPS 域名使用，免单独跑 bot 进程)
# TG_WEBHOOK_URL="https://poker.yourdomain.com/api/telegram/webhook"
EOF
```

---

## 🚀 第二部分：生产部署方案 (三选一)

### 方案 A：使用 PM2 进行进程守护 (强烈推荐，最常用)

PM2 提供了强大的集群管理、内存监控、日志轮转和开机自启功能。项目中已内置优化好的 `ecosystem.config.cjs`。

```bash
# 1. 全局安装 PM2
sudo npm install -g pm2

# 2. 一键启动游戏服务端与运维机器人
pm2 start ecosystem.config.cjs

# 3. 配置开机自启 (服务器重启后自动恢复游戏服务)
pm2 startup
pm2 save

# 常用维护命令速查
pm2 status               # 查看服务运行状态与内存
pm2 logs shisanshui      # 实时查看游戏对战日志
pm2 restart shisanshui   # 重启游戏服务
pm2 stop all             # 停止所有服务
```

---

### 方案 B：使用 Linux 原生 Systemd 系统服务

如果希望直接通过 Linux 系统底层的 `systemctl` 统一纳管：

```bash
# 1. 复制服务单元文件至系统目录
sudo cp shisanshui.service /etc/systemd/system/

# 2. 根据实际项目路径与用户确认服务文件
# 默认配置中 WorkingDirectory=/var/www/shisanshui
sudo systemctl daemon-reload

# 3. 启用并立即启动服务
sudo systemctl enable --now shisanshui

# 4. 查看运行状态与实时日志
sudo systemctl status shisanshui
sudo journalctl -u shisanshui -f
```

---

### 方案 C：使用 Docker & Docker Compose 一键容器化部署

如果您的服务器已安装 Docker，通过容器化部署可以实现与宿主环境完全解耦，秒级构建：

```bash
# 1. 一键后台构建并运行容器
docker compose up -d --build

# 2. 查看容器状态
docker compose ps

# 3. 查看实时日志
docker compose logs -f

# 4. 停止容器
docker compose down
```

---

## 🔒 第三部分：配置 Nginx 反向代理与 HTTPS (SSL) 证书

为了让玩家能够通过优雅的自定义域名（例如 `https://poker.yourdomain.com`）访问，并提供安全的 HTTPS 加密和 WSS 长连接：

### 1. 安装 Nginx 与 Certbot (Let's Encrypt 证书工具)
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 2. 配置 Nginx 站点
创建 `/etc/nginx/sites-available/shisanshui`：
```nginx
server {
    listen 80;
    server_name poker.yourdomain.com; # 替换为您解析到本机的真实域名

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;

        # WebSocket 长连接升级支持
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 透传客户端真实 IP
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
}
```

启用站点并重载 Nginx：
```bash
sudo ln -sf /etc/nginx/sites-available/shisanshui /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. 一键申请免费 SSL 证书 (自动配置 HTTPS)
```bash
sudo certbot --nginx -d poker.yourdomain.com
```
按照提示输入邮箱并同意条款，Certbot 会自动续期证书并开启 HTTPS 强跳。

---

## 🛡️ 第四部分：防火墙与云厂商安全组放行

- **云服务器安全组控制台**：进入阿里云 / 腾讯云 / 华为云 / AWS 控制台，在入方向规则中放行：
  - `TCP 80` (HTTP)
  - `TCP 443` (HTTPS)
  - （如果不走 Nginx，直接放行 `TCP 8080`）
- **服务器本地防火墙 (UFW)**：
  ```bash
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw allow 8080/tcp
  sudo ufw reload
  ```

---

## 🔄 第五部分：代码更新、删除旧文件与重新编译全流程

当 GitHub 仓库更新了代码、新功能或安全补丁后，为了防止旧的打包文件（`dist` 目录及 Vite 编译缓存）残留导致浏览器加载旧版本或冲突，推荐按以下规范流程执行拉取、删旧文件、重新编译与重载服务：

### 1. 标准更新四步曲（以 PM2 部署为例）

```bash
# 进入项目根目录
cd /var/www/shisanshui

# ① 拉取仓库最新代码
git pull origin main

# ② 安装可能新增的依赖包 (如有新依赖)
npm install

# ③ 彻底删除旧编译文件与构建缓存 (核心步骤)
# 方式 A (使用项目预设脚本):
npm run clean
# 方式 B (直接命令行清理 dist 产物与 Vite 缓存):
rm -rf dist node_modules/.vite

# ④ 重新编译静态资源并覆盖旧文件
npm run build

# ⑤ 平滑重载生产服务 (零停机时间)
pm2 reload shisanshui
echo "✓ 生产服务已平滑升级成功！"
```

> 💡 **一键复制连续命令（日常极速推荐）**：
> ```bash
> cd /var/www/shisanshui && git pull && rm -rf dist && npm run build && pm2 reload shisanshui
> ```

---

### 2. 针对不同进程管理器的重启方式

根据您在【第二部分】选择的部署方案，执行对应的重启命令：

| 方案 | 删旧文件重新编译后的重启命令 | 说明 |
| :--- | :--- | :--- |
| **方案 A：PM2 进程守护** | `pm2 reload shisanshui`<br>或 `pm2 restart shisanshui` | `reload` 为零停机平滑重载；`restart` 为硬重启重置全部连接 |
| **方案 B：Systemd 系统服务** | `sudo systemctl restart shisanshui` | 重新拉起后台服务并自动加载全新的 `dist/` 文件 |
| **方案 C：Docker 容器化** | `docker compose build --no-cache`<br>`docker compose up -d` | 废弃旧镜像缓存，重新构建并后台无缝启动新容器 |

---

### 3. 更新后客户端浏览器缓存刷新提示
- 若玩家浏览器打开仍显示旧页面或旧弹窗，可提示玩家在手机或电脑浏览器按 `Ctrl + F5` 强制刷新，或清除站点缓存。
- 服务端会实时提供最新的 HTTP ETag 与静态资源哈希，确保删除旧 `dist` 重新编译后所有玩家均同步至最新版本！
