# 🌐 Serv00 (FreeBSD) 免费虚拟主机深度部署教程

> 本教程专为在 **Serv00** 免费虚拟主机上部署《十三水》多人对战系统而编写。涵盖 **FreeBSD 架构适配**、**512MB 内存严格配额优化**、**Devil 端口申请**、**Phusion Passenger 托管** 以及 **Crontab 故障自愈保活** 的全套解决方案。

---

## 📌 Serv00 主机特性与核心限制深度剖析

Serv00 是基于 **FreeBSD** 系统的免费多用户共享主机，与常规 Linux VPS 存在显著差异：

| 特性 / 限制项 | Serv00 实际机制 | 本项目代码与部署针对性优化 |
| :--- | :--- | :--- |
| **操作系统** | **FreeBSD**（非 Linux），家目录路径为 `/usr/home/你的用户名` | 代码全面采用纯 JavaScript ESM 编写，无任何原生 C++ 编译依赖（无需 node-gyp），100% 兼容 FreeBSD |
| **内存限制** | 单用户所有进程共享 **严格 512MB RAM**，超额立即被系统 `kill -9` | 1. 独立服务端 `server.js` 内存仅占用 **~30MB**<br>2. 默认限制 Node 堆内存 `--max-old-space-size=256`<br>3. 内置 30 秒自动清理超时房间与离线席位机制 |
| **端口管理** | **无法随意监听端口**，必须在 Devil 面板或命令行登记保留端口 | 提供 `devil port add tcp <PORT>` 端口保留全流程引导 |
| **后台进程限制** | 默认可能限制用户后台二进制守护进程 | 必须先开启权限：`devil binexec on` |
| **系统重启与进程清理** | 主机定期维护或清理闲置进程 | 提供专属 `scripts/serv00-keepalive.sh` 脚本配合 FreeBSD Crontab 实现 5 分钟自动自愈 |

---

## 🛠️ 第一部分：Serv00 准备工作与环境开启

通过 SSH 连接到您的 Serv00 服务器：
```bash
ssh 你的用户名@sX.serv00.com # 例如 ssh user@s12.serv00.com
```

### 1. 开启后台进程运行权限 (必做)
在终端执行：
```bash
devil binexec on
```
> 输出 `Succeded` 表示已允许在后台长期运行程序。

### 2. 验证 Node.js 与 Git 环境
Serv00 已内置 Node.js：
```bash
node -v   # 通常为 v18.x 或 v20.x
npm -v
git --version
```

### 3. 克隆本项目代码
```bash
cd ~
git clone https://github.com/wen95266/sx.git
cd sx
```

### 4. 安装依赖 (使用 low-memory 方式)
```bash
npm install
```

---

## 🚀 第二部分：部署模式 (推荐方案一：Devil 保留端口独立服务)

在 Serv00 上，**保留专属 TCP 端口 + 独立 Node 服务** 是最稳定、最不易受 Passenger 干扰的部署方式。

### 步骤 1：申请保留专属 TCP 端口
Serv00 要求用户必须先登记端口才能在对外网络中监听。运行：
```bash
# 申请一个 1024 ~ 64000 之间的随机高位端口，例如 28456
devil port add tcp 28456
```
> 如果提示该端口已被其他用户占用，换一个数字重试即可（例如 `38456`）。  
> 记下您申请成功的端口号。

### 步骤 2：配置项目环境变量 `.env`
在 `~/sx` 目录下创建并写入 `.env`：
```bash
cat << EOF > .env
# 填入您在第一步申请成功的端口号
PORT=28456
HOST=0.0.0.0

# Telegram 运维机器人 (可选)
TG_BOT_TOKEN="你的Telegram_Bot_Token"
TG_ADMIN_ID="你的Telegram_数字用户ID"
EOF
```

### 步骤 3：低内存编译前端静态资源
为了防止在 Serv00 编译时瞬时内存超出 512MB，本项目专门配置了 `build:lowmem`：
```bash
npm run build:lowmem
```
> 💡 编译完成后，`dist/` 目录中已生成纯静态文件，服务端启动只需数十兆内存。

### 步骤 4：极速启动与验证
```bash
# 以低内存模式启动服务
npm run start:lowmem
```
控制台会输出：
```text
======================================================
🀄 十三水 (Chinese Poker) 高性能服务端已成功启动！
🚀 监听地址: http://0.0.0.0:28456
🌐 系统平台: freebsd (x64)
💾 初始内存占用: 29.8 MB (超轻量设计，极致省电省内存)
======================================================
```
此时在电脑或手机浏览器打开：
👉 `http://你的主机名.serv00.com:28456` (例如 `http://s12.serv00.com:28456`)
即可直接畅玩十三水！

---

## 🔄 第三部分：Serv00 7×24 小时 Crontab 定时保活与自愈

Serv00 会定期清理进程或重启节点，为了实现**全自动后台持久运行**，无需手动干预：

### 1. 赋予保活脚本执行权限
```bash
chmod +x scripts/serv00-keepalive.sh
```

### 2. 配置 FreeBSD Crontab 定时检测
在终端运行：
```bash
crontab -e
```
进入编辑模式后，添加以下一行（请将 `YOUR_USERNAME` 替换为您真实的 Serv00 用户名）：
```cron
*/5 * * * * /usr/home/YOUR_USERNAME/sx/scripts/serv00-keepalive.sh >/dev/null 2>&1
```
保存并退出 (`:wq`)。

> 💡 **原理解析**：
> FreeBSD 系统每隔 5 分钟会自动执行一次该脚本。
> - 如果检测到十三水进程因内存限制或节点重启退出，会自动以 `--max-old-space-size=256` 极低内存模式在后台重新拉起！
> - 如果服务已在正常运行，则无需重复启动。真正做到长期免维护。

---

## 🌐 第四部分：方案二（通过 Serv00 域名与 Phusion Passenger 托管）

如果您希望直接通过绑定的 80/443 二级域名访问，而不用在网址后面带 `:28456` 端口号：

1. **在 Serv00 添加 Node.js 类型网站**：
   ```bash
   devil www add 你的域名.serv00.net nodejs /usr/local/bin/node
   ```
2. **连接网站目录到本项目**：
   Serv00 默认创建的目录为 `/usr/home/你的用户名/domains/你的域名.serv00.net/public_nodejs`。
   将该目录软链接或指向我们的项目：
   ```bash
   rm -rf /usr/home/你的用户名/domains/你的域名.serv00.net/public_nodejs
   ln -s /usr/home/你的用户名/sx /usr/home/你的用户名/domains/你的域名.serv00.net/public_nodejs
   ```
3. **确认入口文件**：
   本项目根目录已内置 `app.js` 与 `server.js`，自动识别并完美适配 Phusion Passenger 协议。
4. **重载网站服务**：
   ```bash
   devil www restart 你的域名.serv00.net
   ```
   直接打开 `http://你的域名.serv00.net` 即可通过原生域名进入游戏。

---

## ❓ Serv00 常见问题与避坑指南

### 1. 提示 `Out of memory` 或进程被 `Killed`
**原因**：同时运行了太多进程或在 Serv00 执行了高耗能命令。  
**解决**：
1. 检查正在运行的进程：`ps aux | grep 你的用户名`
2. 杀掉多余的闲置进程：`killall -9 node`
3. 使用预置的低内存模式启动：`npm run start:lowmem`

### 2. 外部网络无法访问端口？
**检查清单**：
1. 是否已执行 `devil port add tcp 你的端口`？（未添加的端口会被 Serv00 防火墙直接拦截）
2. `.env` 中的 `PORT` 是否与添加的端口一致？
3. 检查当前监听状态：`sockstat -4 -l | grep 你的端口`

### 3. Telegram Bot 无法连接？
Serv00 服务器位于境外，通常可直连 Telegram API。如果无法接收消息，请确认 `.env` 中的 `TG_BOT_TOKEN` 正确无多余空格。
