# 📱 Android Termux 极速部署与保活实战教程

> 本教程专为在安卓手机上通过 **Termux 终端** 运行《十三水》多人对战系统而编写。涵盖从零安装、局域网面对面开黑、公网穿透以及防止安卓后台休眠杀进程的完整解决方案。

---

## 📌 Termux 系统特性与运行限制说明

| 特性 / 限制项 | 机制说明 | 针对性优化方案 |
| :--- | :--- | :--- |
| **Bionic Libc & ARM 架构** | 运行在 Android Bionic C 库与 ARM64/ARMv7 处理器上 | 采用纯 Node.js ESM 原生语法，无需 C++ 原生编译插件，开箱即用 |
| **无 Root 权限与端口限制** | 普通用户无法监听低于 1024 的特权端口 (如 80、443) | 默认配置并推荐使用 `8080` 或 `3000` 高位端口 |
| **安卓电池管理与进程强杀 (LMK)** | 熄屏后系统自动进入 Doze 深度休眠，回收后台内存 | 1. 采用生产级轻量服务 (`npm start`)，内存占用仅 **25MB**（较 Vite 开发态省电 80%）<br>2. 开启 `termux-wake-lock` 阻止 CPU 挂起 |
| **移动网络 NAT 隔离** | 手机通常处于运营商私网 IPv4 环境，外网无法直连 | 内置免费 Cloudflare Tunnel 极速穿透方案，无需公网 IP 即可跨城联机 |

---

## 🚀 第一部分：5 分钟极速安装与启动

### 步骤 1：安装官方可用版本的 Termux
> ⚠️ **重要警告**：请勿使用 Google Play 商店的 Termux（2020 年已停止维护，无法更新软件源）。  
> 请从 [F-Droid 官方镜像](https://f-droid.org/packages/com.termux/) 下载最新版 APK 并安装。

### 步骤 2：安装基础运行环境
打开手机上的 Termux，执行：

```bash
# 换国内镜像源 (可选，如遇网络慢执行：termux-change-repo)
pkg update -y && pkg install -y git nodejs-lts
```

验证环境版本：
```bash
node -v   # 输出 v20.x 或更高
git --version
```

### 步骤 3：拉取项目代码与安装依赖
```bash
# 克隆仓库
git clone https://github.com/wen95266/sx.git
cd sx

# 安装依赖
npm install
```

### 步骤 4：启动游戏服务 (两种模式任选)

#### 推荐方案 A：生产轻量极速模式 (省电 80%、超低内存、防杀后台)
```bash
# 首次运行或更新代码后先编译静态资源
npm run build

# 启动轻量服务端 (默认 8080 端口，仅需约 25MB 内存)
npm start
```

#### 方案 B：开发调试模式 (支持前端热重载)
```bash
npm run dev:8080
```

打开手机自带浏览器（Chrome、Edge 或系统浏览器），访问：
👉 `http://127.0.0.1:8080`
即可进入十三水对战大厅！

---

## 👥 第二部分：局域网面对面开黑 (WiFi / 手机热点)

想让身边的朋友在同一个 WiFi 或连接您的手机热点一起开黑对战：

### 1. 查询手机局域网 IP
在 Termux 中输入：
```bash
ifconfig | grep "inet "
```
通常会看到类似 `192.168.1.108`（家庭 WiFi）或 `192.168.43.1`（手机热点）。

### 2. 好友加入对战
- **如果是家庭 / 宿舍 WiFi**：好友连接同一个 WiFi，在其手机浏览器输入：
  `http://192.168.1.108:8080`
- **如果是户外无网络场景**：您打开手机【个人热点】，好友连接您的热点后，在其浏览器输入：
  `http://192.168.43.1:8080`

即可 4 人或 8 人实时联机！

---

## 🌐 第三部分：异地跨网联机 (免费 Cloudflare 穿透)

即使好友不在身边，也无需购买云服务器和域名，只需利用 Termux 运行 Cloudflare Tunnel：

```bash
# 1. 安装 cloudflared
pkg install -y cloudflared

# 2. 一键创建免费公网安全通道
cloudflared tunnel --url http://127.0.0.1:8080
```
终端会输出类似一行：
`https://your-random-subdomain.trycloudflare.com`

直接将该 HTTPS 网址分享到微信或 QQ 群，异地好友点击即可直接进房对战！

---

## 🔋 第四部分：Android 后台 7×24 小时保活与防休眠

为了避免手机熄屏后安卓系统杀死 Termux，请依次完成以下三项设置：

### 1. 获取 CPU 唤醒锁 (Wake Lock)
在 Termux 中输入：
```bash
termux-wake-lock
```
此时手机状态栏会显示 `Termux (wake lock held)` 图标，阻止 CPU 深度休眠。

### 2. 关闭安卓电池优化白名单
- 打开手机系统【设置】➔【应用管理】➔【Termux】。
- 找到【省电策略】或【电池管理】，修改为**「无限制」**或**「允许后台高耗电」**。
- 开启【允许自启动】与【允许后台活动】。

### 3. 使用 tmux 保持后台会话 (防止关闭窗口退出)
```bash
# 安装 tmux
pkg install -y tmux

# 创建后台长存会话
tmux new -s sx

# 在 tmux 窗口中启动服务
cd ~/sx && npm start
```
> 💡 **脱离会话**：按键盘 `Ctrl + B` 然后按 `D` 即可安全返回手机主屏，服务在后台永不停机！  
> 💡 **重新接入**：再次打开 Termux 输入 `tmux attach -t sx` 即可恢复窗口。

---

## 🤖 第五部分：配置 Telegram 运维机器人

机器人可让您随时在手机 Telegram 聊天框中输入指令，监控服务器状态、审批玩家手机号白名单或下发全服公告。

1. 在项目目录编辑 `.env`：
   ```bash
   cat << 'EOF' > .env
   TG_BOT_TOKEN="你的Telegram机器人Token"
   TG_ADMIN_ID="你的Telegram数字用户ID"
   PORT=8080
   EOF
   ```
2. 启动机器人：
   ```bash
   npm run bot
   ```
3. 机器人会自动发送「上线通知」，并带有**中文快捷键盘**，点击即可执行查询状态、授权手机号等操作。

---

## 🔄 第六部分：Termux 拉取仓库更新、删除旧文件与重新编译全流程

当 GitHub 仓库更新了最新代码后，由于安卓手机存储机制及手机浏览器强缓存特性，必须规范执行**停止旧服务 ➔ 拉取最新代码 ➔ 彻底删除旧编译文件 ➔ 重新构建覆盖 ➔ 重新拉起**：

### 1. 标准规范更新流程

```bash
# 1. 进入手机项目根目录
cd ~/sx

# 2. 停止当前正在运行的旧游戏服务 (释放 8080 端口与手机内存)
pkill -f node

# 3. 拉取 GitHub 仓库最新代码
git pull origin main

# 4. 如有新增依赖包，执行安装
npm install

# 5. 彻底删除旧编译静态文件与 Vite 构建缓存 (避免旧牌面样式与逻辑残留)
rm -rf dist node_modules/.vite
# 或运行项目内置清理命令:
npm run clean

# 6. 重新编译静态资源并覆盖旧文件
npm run build

# 7. 重新启动全新服务端
npm start
```

> 💡 **Termux 一键极速连招更新命令（手机端推荐收藏）**：
> ```bash
> cd ~/sx && pkill -f node; git pull && rm -rf dist && npm run build && npm start
> ```

> 💡 **如果在 tmux 后台会话中运行**：
> 1. 先进入原有会话：`tmux attach -t sx`
> 2. 按键盘 `Ctrl + C` 终止正在运行的旧服务。
> 3. 粘贴执行：`git pull && rm -rf dist && npm run build && npm start`
> 4. 按 `Ctrl + B` 然后按 `D` 安全脱离会话，后台持续无忧运行！

---

## ❓ 第七部分：常见问题排查 (FAQ)

### Q1：提示 `Error: listen EADDRINUSE: address already in use :::8080`
**原因**：旧的服务端进程还在后台运行占用了 8080 端口。  
**解决**：
```bash
pkill -f "node"
npm start
```

### Q2：更新代码后手机打开仍然显示旧版本、旧牌面或旧聊天界面？
**原因**：未删除旧 `dist` 编译产物，或者手机浏览器（Chrome/夸克/自带浏览器）开启了激进的本地静态资源强缓存。  
**彻底解决步骤**：
1. **服务器端删除旧文件重新编译**：
   ```bash
   cd ~/sx && rm -rf dist node_modules/.vite && npm run build
   pkill -f node && npm start
   ```
2. **手机浏览器端刷新**：
   - 在手机浏览器设置中清除当前站点的“缓存图片和文件”。
   - 或使用手机浏览器的【无痕模式/隐身标签页】重新打开 `http://127.0.0.1:8080`，即可 100% 确保加载最新编译的游戏程序！
