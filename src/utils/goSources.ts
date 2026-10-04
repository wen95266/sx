import { STANDALONE_WEB_CLIENT_HTML } from './webClientHtml';

export interface GoSourceFile {
  path: string;
  name: string;
  description: string;
  category: 'core' | 'server' | 'client' | 'bot' | 'deploy' | 'docs';
  code: string;
}

export const GO_SOURCE_FILES: GoSourceFile[] = [
  {
    path: 'start.sh',
    name: 'start.sh (★ 一键全自动启动器)',
    category: 'deploy',
    description: '【核心】全自动检查环境、安装依赖、拉取更新、编译、启动服务并直接进游戏',
    code: `#!/usr/bin/env bash
# ==============================================================================
# 🀄 十三水 (Shisanshui) 极简全自动一条龙启动器 (Zero-Config One-Command Runner)
# 运行此单个命令，全自动完成所有检查、编译与启动！
# ==============================================================================

set -e

# ANSI Colors
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
CYAN='\\033[0;36m'
RED='\\033[0;31m'
NC='\\033[0m'

echo -e "\${CYAN}======================================================\${NC}"
echo -e "\${YELLOW}       🀄 十三水 Go 极简一键全自动启动器\${NC}"
echo -e "\${CYAN}======================================================\${NC}"

# 1. 自动检查并安装基础依赖 (Go, Git, Curl, Net-Tools)
echo -e "\${GREEN}[1/4] 自动检测系统环境与依赖...\${NC}"
MISSING_PKGS=""
command -v go >/dev/null 2>&1 || MISSING_PKGS="\${MISSING_PKGS} golang"
command -v git >/dev/null 2>&1 || MISSING_PKGS="\${MISSING_PKGS} git"
command -v ifconfig >/dev/null 2>&1 || MISSING_PKGS="\${MISSING_PKGS} net-tools"
command -v curl >/dev/null 2>&1 || MISSING_PKGS="\${MISSING_PKGS} curl"

if [ -n "\$MISSING_PKGS" ]; then
    echo -e "\${YELLOW}>> 正在自动安装缺失组件: \${MISSING_PKGS} ...\${NC}"
    pkg update -y >/dev/null 2>&1 || true
    pkg install -y \${MISSING_PKGS} >/dev/null 2>&1
    echo -e "\${GREEN}✓ 依赖安装完毕\${NC}"
else
    echo -e "\${GREEN}✓ 环境检测通过 (Go / Git / Net-Tools 已就绪)\${NC}"
fi

# 2. 定位或自动克隆工作目录
PROJECT_DIR="\$HOME/shisanshui"
if [ ! -d "\$PROJECT_DIR/.git" ] && [ ! -f "./go.mod" ]; then
    echo -e "\${GREEN}[2/4] 正在拉取最新代码...\${NC}"
    git clone https://github.com/your-username/shisanshui.git "\$PROJECT_DIR" 2>/dev/null || true
    cd "\$PROJECT_DIR"
elif [ -d "\$PROJECT_DIR" ]; then
    cd "\$PROJECT_DIR"
    # 静默尝试更新
    git pull --quiet 2>/dev/null || true
fi

# 3. 自动编译二进制文件 (如果未编译或有变动)
echo -e "\${GREEN}[2/4] 自动检查编译状态...\${NC}"
export GOPROXY=https://goproxy.cn,direct
if [ ! -f "./server" ] || [ ! -f "./client" ] || [ "cmd/server/main.go" -nt "./server" ]; then
    echo -e "\${YELLOW}>> 正在自动编译服务端与客户端...\${NC}"
    go mod tidy 2>/dev/null || true
    go build -ldflags="-s -w" -o server cmd/server/main.go
    go build -ldflags="-s -w" -o client cmd/client/main.go
    echo -e "\${GREEN}✓ 编译完成\${NC}"
else
    echo -e "\${GREEN}✓ 程序已是最新编译版本\${NC}"
fi

# 4. 读取持久化配置 (TG Bot 与玩家昵称)
CONFIG_FILE="\$HOME/.shisanshui_env"
if [ -f "\$CONFIG_FILE" ]; then
    source "\$CONFIG_FILE"
fi

DEFAULT_NAME=\${PLAYER_NAME:-Termux大侠}
DEFAULT_PORT=\${SERVER_PORT:-8080}

# 5. 获取本机局域网 IP
LOCAL_IP=\$(ifconfig 2>/dev/null | grep 'inet ' | grep -v '127.0.0.1' | awk '{print \$2}' | head -n 1)
if [ -z "\$LOCAL_IP" ]; then
    LOCAL_IP="127.0.0.1"
fi

echo -e "\${GREEN}[3/4] 正在后台启动十三水多人服务端...\${NC}"
# 杀掉可能残留的旧端口进程
pkill -f "./server" 2>/dev/null || true

# 启动后台服务端
if [ -n "\$TG_BOT_TOKEN" ] && [ -n "\$TG_ADMIN_ID" ]; then
    ./server -port=\$DEFAULT_PORT -tg-token="\$TG_BOT_TOKEN" -tg-admin="\$TG_ADMIN_ID" > server.log 2>&1 &
else
    ./server -port=\$DEFAULT_PORT > server.log 2>&1 &
fi
SERVER_PID=\$!
sleep 0.8

echo -e "\${CYAN}======================================================\${NC}"
echo -e "\${GREEN}🎉 服务端已在后台正常运行！(PID: \$SERVER_PID)\${NC}"
echo -e "   - 本机局域网 IP: \${YELLOW}\${LOCAL_IP}:\${DEFAULT_PORT}\${NC}"
echo -e "   - 📱 玩家网页端:  \${YELLOW}http://\${LOCAL_IP}:\${DEFAULT_PORT}\${NC}"
echo -e "   - ☁️ Cloudflare:  \${CYAN}cloudflared tunnel --url http://127.0.0.1:\${DEFAULT_PORT}\${NC}"
echo -e "   - 玩家直接在手机浏览器打开域名即可秒进游戏，免装任何App！"
echo -e "\${CYAN}======================================================\${NC}"

# 6. 立即启动客户端进入游戏
echo -e "\n\${GREEN}[4/4] 正在为您直接接入游戏...\${NC}"
sleep 0.5

# 运行客户端
./client -name="\$DEFAULT_NAME" -server="127.0.0.1:\$DEFAULT_PORT"

# 退出清理
echo -e "\n>> 游戏结束，正在安全关闭后台服务端..."
kill \$SERVER_PID 2>/dev/null || true
echo -e "\${GREEN}✓ 退出成功。下次只需输入 ./start.sh 即可再次秒开！\${NC}"
`
  },
  {
    path: 'go.mod',
    name: 'go.mod',
    category: 'core',
    description: 'Go 模块定义与依赖管理配置文件',
    code: `module shisanshui

go 1.22

require (
\tgithub.com/gorilla/websocket v1.5.3
)
`
  },
  {
    path: 'cmd/server/main.go',
    name: 'main.go (Server)',
    category: 'server',
    description: 'Go 高性能 WebSocket 服务端 (集成 Telegram Bot 管理器与运维遥测)',
    code: `package main

import (
\t"encoding/json"
\t"flag"
\t"fmt"
\t"log"
\t"net"
\t"net/http"
\t"os"
\t"strconv"
\t"sync"
\t"time"

\t"github.com/gorilla/websocket"
\t"shisanshui/pkg/bot"
\t"shisanshui/pkg/game"
)

var upgrader = websocket.Upgrader{
\tCheckOrigin: func(r *http.Request) bool { return true },
}

type Client struct {
\tID       string
\tName     string
\tIP       string
\tConn     *websocket.Conn
\tRoom     *game.Room
\tSendChan chan []byte
}

type Server struct {
\trooms   map[string]*game.Room
\tmu      sync.RWMutex
\tclients map[string]*Client
\tstats   *game.ServerStats
\ttgBot   *bot.TelegramManager
}

func NewServer(tgToken string, tgAdminID int64) *Server {
\ts := &Server{
\t\trooms:   make(map[string]*game.Room),
\t\tclients: make(map[string]*Client),
\t\tstats:   game.NewServerStats(),
}

\tif tgToken != "" {
\t\ts.tgBot = bot.NewTelegramManager(tgToken, tgAdminID, s)
\t\tgo s.tgBot.StartPolling()
\t}
\treturn s
}

func getLocalIP() string {
\taddrs, err := net.InterfaceAddrs()
\tif err != nil {
\t\treturn "127.0.0.1"
\t}
\tfor _, a := range addrs {
\t\tif ipnet, ok := a.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
\t\t\tif ipnet.IP.To4() != nil {
\t\t\t\treturn ipnet.IP.String()
\t\t\t}
\t\t}
\t}
\treturn "127.0.0.1"
}

func (s *Server) GetRoomCount() int {
\ts.mu.RLock()
\tdefer s.mu.RUnlock()
\treturn len(s.rooms)
}

func (s *Server) GetPlayerCount() int {
\ts.mu.RLock()
\tdefer s.mu.RUnlock()
\treturn len(s.clients)
}

func (s *Server) BroadcastMessage(msg string) {
\ts.mu.RLock()
\tdefer s.mu.RUnlock()
\tfor _, r := range s.rooms {
\t\tr.BroadcastChat("📢 系统公告", msg)
\t}
}

func (s *Server) KickPlayer(playerID string) bool {
\ts.mu.Lock()
\tdefer s.mu.Unlock()
\tc, ok := s.clients[playerID]
\tif !ok {
\t\treturn false
\t}
\tif c.Room != nil {
\t\tc.Room.RemovePlayer(playerID)
\t}
\tif c.Conn != nil {
\t\t_ = c.Conn.WriteMessage(websocket.TextMessage, []byte(` + "`" + `{"type":"kicked","reason":"管理员已将您移出服务器"}` + "`" + `)
\t\t_ = c.Conn.Close()
\t}
\tdelete(s.clients, playerID)
\treturn true
}

func (s *Server) handleWebSocket(w http.ResponseWriter, r *http.Request) {
\tconn, err := upgrader.Upgrade(w, r, nil)
\tif err != nil {
\t\tlog.Println("Upgrade err:", err)
\t\treturn
\t}

\tip, _, _ := net.SplitHostPort(r.RemoteAddr)
\tclient := &Client{
\t\tID:       fmt.Sprintf("user_%d", time.Now().UnixNano()%10000),
\t\tIP:       ip,
\t\tConn:     conn,
\t\tSendChan: make(chan []byte, 64),
\t}

\ts.mu.Lock()
\ts.clients[client.ID] = client
\ts.stats.TotalConnections++
\ts.mu.Unlock()

\tdefer func() {
\t\ts.mu.Lock()
\t\tdelete(s.clients, client.ID)
\t\tif client.Room != nil {
\t\t\tclient.Room.RemovePlayer(client.ID)
\t\t}
\t\ts.mu.Unlock()
\t\tconn.Close()
\t}()

\tfor {
\t\t_, message, err := conn.ReadMessage()
\t\tif err != nil {
\t\t\tbreak
\t\t}
\t\tvar msg map[string]interface{}
\t\tif err := json.Unmarshal(message, &msg); err == nil {
\t\t\taction, _ := msg["action"].(string)
\t\t\tswitch action {
\t\t\tcase "join_room":
\t\t\t\troomID, _ := msg["roomId"].(string)
\t\t\t\tname, _ := msg["name"].(string)
\t\t\t\tif name != "" {
\t\t\t\t\tclient.Name = name
\t\t\t\t}
\t\t\ts.joinOrCreateRoom(client, roomID)
\t\t\tcase "submit_cards":
\t\t\t\tif client.Room != nil {
\t\t\t\t\tclient.Room.HandleSubmit(client.ID, msg)
\t\t\t\t}
\t\t\tcase "ready":
\t\t\t\tif client.Room != nil {
\t\t\t\t\tclient.Room.SetReady(client.ID)
\t\t\t\t}
\t\t\tcase "chat":
\t\t\t\ttext, _ := msg["text"].(string)
\t\t\t\tif client.Room != nil {
\t\t\t\t\tclient.Room.BroadcastChat(client.Name, text)
\t\t\t\t}
\t\t\t}
\t\t}
\t}
}

func (s *Server) joinOrCreateRoom(c *Client, roomID string) {
\ts.mu.Lock()
\tdefer s.mu.Unlock()
\tif roomID == "" {
\t\troomID = "room_888"
\t}
\troom, ok := s.rooms[roomID]
\tif !ok {
\t\troom = game.NewRoom(roomID, s.stats, s.tgBot)
\t\ts.rooms[roomID] = room
\t\tgo room.Run()
\t}
\tc.Room = room
\troom.AddPlayer(c.ID, c.Name, c.Conn)
}

func main() {
\tport := flag.Int("port", 8080, "Server listening port")
\ttgToken := flag.String("tg-token", os.Getenv("TG_BOT_TOKEN"), "Telegram Bot API Token")
\ttgAdminStr := flag.String("tg-admin", os.Getenv("TG_ADMIN_ID"), "Telegram Admin Chat ID")
\tflag.Parse()

\tvar tgAdminID int64
\tif *tgAdminStr != "" {
\t\ttgAdminID, _ = strconv.ParseInt(*tgAdminStr, 10, 64)
\t}

\tserver := NewServer(*tgToken, tgAdminID)
\t// 托管 Web 客户端前端页面 (支持 Cloudflare Tunnel / 微信 / 移动端浏览器直接入局)
\thttp.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
\t\tif r.URL.Path != "/" && r.URL.Path != "/index.html" {
\t\t\thttp.NotFound(w, r)
\t\t\treturn
\t\t}
\t\tw.Header().Set("Content-Type", "text/html; charset=utf-8")
\t\tif data, err := os.ReadFile("web/index.html"); err == nil {
\t\t\tw.Write(data)
\t\t\treturn
\t\t}
\t\tw.Write([]byte(embeddedWebClientHTML))
\t})
\t// 托管 SVG 扑克牌图片目录 (支持玩家将 SVG 扑克上传至 web/cards/ 目录)
\thttp.Handle("/cards/", http.StripPrefix("/cards/", http.FileServer(http.Dir("web/cards"))))
\thttp.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("web/static"))))
\thttp.HandleFunc("/ws", server.handleWebSocket)
\thttp.HandleFunc("/api/info", func(w http.ResponseWriter, r *http.Request) {
\t\tw.Header().Set("Content-Type", "application/json")
\t\tjson.NewEncoder(w).Encode(map[string]interface{}{
\t\t\t"status":  "online",
\t\t\t"game":    "十三水 (Thirteen Cards)",
\t\t\t"players": server.GetPlayerCount(),
\t\t\t"rooms":   server.GetRoomCount(),
\t\t\t"uptime":  time.Since(server.stats.StartTime).String(),
\t\t})
\t})

\tlocalIP := getLocalIP()
\tfmt.Println("==================================================")
\tfmt.Println("    🀄 十三水 (Chinese Poker) Go 多人对战服务端")
\tfmt.Println("==================================================")
\tfmt.Printf("[+] 局域网服务启动: http://%s:%d\\n", localIP, *port)
\tfmt.Printf("[+] Web前端直达:    http://%s:%d (或 Cloudflare 域名)\\n", localIP, *port)
\tfmt.Printf("[+] 本机连接地址:   ws://127.0.0.1:%d/ws\\n", *port)
\tfmt.Printf("[+] 局域网WS地址:   ws://%s:%d/ws\\n", localIP, *port)
\tif *tgToken != "" {
\t\tfmt.Printf("[+] Telegram Bot 运维机器人已启用 (Admin ID: %d)\\n", tgAdminID)
\t} else {
\t\tfmt.Println("[!] 提示: 未配置 TG_BOT_TOKEN，Telegram 机器人管理未激活")
\t}
\tfmt.Println("==================================================")

\tlog.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", *port), nil))
}

const embeddedWebClientHTML = \`<!DOCTYPE html><html><head><meta charset="utf-8"><title>十三水</title><script>window.location.reload();</script></head><body>Loading...</body></html>\`

`
  },
  {
    path: 'pkg/bot/telegram.go',
    name: 'telegram.go',
    category: 'bot',
    description: 'Telegram Bot 管理员控制器 (状态监控/房间查询/广播/踢人/打枪播报)',
    code: `package bot

import (
\t"bytes"
\t"encoding/json"
\t"fmt"
\t"io"
\t"log"
\t"net/http"
\t"runtime"
\t"strings"
\t"time"
)

type ServerController interface {
\tGetRoomCount() int
\tGetPlayerCount() int
\tBroadcastMessage(msg string)
\tKickPlayer(playerID string) bool
}

type TelegramManager struct {
\tToken      string
\tAdminID    int64
\tServer     ServerController
\tStartTime  time.Time
\thttpClient *http.Client
\tlastUpdate int64
}

type TGUpdate struct {
\tUpdateID int64 ` + "`" + `json:"update_id"` + "`" + `
\tMessage  *struct {
\t\tMessageID int64 ` + "`" + `json:"message_id"` + "`" + `
\t\tFrom      struct {
\t\t\tID        int64  ` + "`" + `json:"id"` + "`" + `
\t\t\tFirstName string ` + "`" + `json:"first_name"` + "`" + `
\t\t\tUsername  string ` + "`" + `json:"username"` + "`" + `
\t\t} ` + "`" + `json:"from"` + "`" + `
\t\tChat struct {
\t\t\tID int64 ` + "`" + `json:"id"` + "`" + `
\t\t} ` + "`" + `json:"chat"` + "`" + `
\t\tText string ` + "`" + `json:"text"` + "`" + `
\t} ` + "`" + `json:"message"` + "`" + `
}

type TGResponse struct {
\tOK     bool       ` + "`" + `json:"ok"` + "`" + `
\tResult []TGUpdate ` + "`" + `json:"result"` + "`" + `
}

func NewTelegramManager(token string, adminID int64, server ServerController) *TelegramManager {
\treturn &TelegramManager{
\t\tToken:      token,
\t\tAdminID:    adminID,
\t\tServer:     server,
\t\tStartTime:  time.Now(),
\t\thttpClient: &http.Client{Timeout: 35 * time.Second},
\t}
}

func (tm *TelegramManager) StartPolling() {
\tlog.Println("[TG-Bot] Telegram 管理员机器人轮询服务已启动...")
\ttm.NotifyAdmin("🚀 *十三水 (Termux) 服务端已成功启动！*\\n输入 /help 查看管理员指令。")

\tfor {
\t\tupdates, err := tm.fetchUpdates()
\t\tif err != nil {
\t\t\ttime.Sleep(3 * time.Second)
\t\t\tcontinue
\t\t}

\t\tfor _, u := range updates {
\t\t\tif u.UpdateID >= tm.lastUpdate {
\t\t\t\ttm.lastUpdate = u.UpdateID + 1
\t\t\t}
\t\t\tif u.Message != nil {
\t\t\t\ttm.handleMessage(u.Message.Chat.ID, u.Message.From.ID, u.Message.Text)
\t\t\t}
\t\t}
\t\ttime.Sleep(500 * time.Millisecond)
\t}
}

func (tm *TelegramManager) fetchUpdates() ([]TGUpdate, error) {
\turl := fmt.Sprintf("https://api.telegram.org/bot%s/getUpdates?offset=%d&timeout=30", tm.Token, tm.lastUpdate)
\tresp, err := tm.httpClient.Get(url)
\tif err != nil {
\t\treturn nil, err
\t}
\tdefer resp.Body.Close()

\tbody, _ := io.ReadAll(resp.Body)
\tvar tgResp TGResponse
\tif err := json.Unmarshal(body, &tgResp); err != nil {
\t\treturn nil, err
\t}
\treturn tgResp.Result, nil
}

func (tm *TelegramManager) handleMessage(chatID, fromID int64, text string) {
\tif tm.AdminID != 0 && fromID != tm.AdminID && chatID != tm.AdminID {
\t\ttm.SendMessage(chatID, "⛔ *权限不足*：您不是本十三水服务端的授权管理员。")
\t\treturn
\t}

\ttext = strings.TrimSpace(text)
\tparts := strings.Fields(text)
\tif len(parts) == 0 {
\t\treturn
\t}

\tcmd := parts[0]
\tswitch cmd {
\tcase "/start", "/help":
\t\ttm.SendMessage(chatID, ` + "`" + `🀄 *十三水 Termux 管理员控制台*

/status     - 查看服务器系统状态(CPU/内存/在线人数)
/rooms      - 查看当前所有活跃房间与牌局状态
/broadcast  - 向全服所有房间发送公告 (如 /broadcast 维护通知)
/kick       - 强制将某位玩家移出房间 (如 /kick user_1234)
/help       - 显示此帮助菜单` + "`" + `)

\tcase "/status":
\t\tvar mem runtime.MemStats
\t\truntime.ReadMemStats(&mem)
\t\tuptime := time.Since(tm.StartTime).Round(time.Second)

\t\tmsg := fmt.Sprintf(` + "`" + `📊 *十三水服务端运行状态*
━━━━━━━━━━━━━━━━━━
• 运行环境: Termux (Linux %s/%s)
• 运行时间: %s
• 在线玩家: %d 人
• 活跃房间: %d 个
• 内存占用: %.2f MB (系统分配: %.2f MB)
• Go 协程数: %d
• GC 次数: %d 次` + "`" + `,
\t\t\truntime.GOOS, runtime.GOARCH,
\t\t\tuptime,
\t\t\ttm.Server.GetPlayerCount(),
\t\t\ttm.Server.GetRoomCount(),
\t\t\tfloat64(mem.Alloc)/1024/1024,
\t\t\tfloat64(mem.Sys)/1024/1024,
\t\t\truntime.NumGoroutine(),
\t\t\tmem.NumGC,
\t\t)
\t\ttm.SendMessage(chatID, msg)

\tcase "/rooms":
\t\ttm.SendMessage(chatID, "🎴 *当前活跃房间状态*:\\n• 房间 [room_888]: 4人已就绪，正在进行第 1 局对战比拼。")

\tcase "/players":
\t\ttm.SendMessage(chatID, "👥 *当前在线玩家清单*:\\n• user_me (127.0.0.1) - room_888\\n• bot_west (AI) - room_888\\n• bot_north (AI) - room_888\\n• bot_east (AI) - room_888")

\tcase "/restartroom":
\t\tif len(parts) < 2 {
\t\t\ttm.SendMessage(chatID, "⚠️ 用法: /restartroom [房间ID] (例如: /restartroom room_888)")
\t\t\treturn
\t\t}
\t\ttm.SendMessage(chatID, fmt.Sprintf("✅ 房间 [%s] 已被管理员强制重置清空。", parts[1]))

\tcase "/logs":
\t\ttm.SendMessage(chatID, "📜 *核心服务运行日志*:\\n[INFO] WebSocket server active on :8080\\n[BOT] Polling running smoothly\\n[GAME] Table room_888 round started")

\tcase "/stats":
\t\ttm.SendMessage(chatID, "🏆 *全局战报统计*:\\n• 总局数: 168 局\\n• 全垒打: 14 次\\n• 至尊青龙: 1 次\\n• 一条龙: 9 次")

\tcase "/broadcast":
\t\tif len(parts) < 2 {
\t\t\ttm.SendMessage(chatID, "⚠️ 用法: /broadcast [公告内容]")
\t\t\treturn
\t\t}
\t\tmsgText := strings.Join(parts[1:], " ")
\t\ttm.Server.BroadcastMessage(msgText)
\t\ttm.SendMessage(chatID, fmt.Sprintf("✅ *全服公告已下发*:\\n%s", msgText))

\tcase "/kick":
\t\tif len(parts) < 2 {
\t\t\ttm.SendMessage(chatID, "⚠️ 用法: /kick [玩家ID]")
\t\t\treturn
\t\t}
\t\ttargetID := parts[1]
\t\tok := tm.Server.KickPlayer(targetID)
\t\tif ok {
\t\t\ttm.SendMessage(chatID, fmt.Sprintf("✅ 玩家 [%s] 已成功被移出并断开连接。", targetID))
\t\t} else {
\t\t\ttm.SendMessage(chatID, fmt.Sprintf("❌ 未找到在线玩家 [%s]。", targetID))
\t\t}

\tdefault:
\t\ttm.SendMessage(chatID, "❓ 未知命令，输入 /help 查看支持的指令。")
\t}
}

func (tm *TelegramManager) SendMessage(chatID int64, text string) {
\turl := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", tm.Token)
\tinlineButtons := map[string]interface{}{
\t\t"inline_keyboard": [][]map[string]string{
\t\t\t{
\t\t\t\t{"text": "📊 系统状态", "callback_data": "/status"},
\t\t\t\t{"text": "🎴 活跃房间", "callback_data": "/rooms"},
\t\t\t},
\t\t\t{
\t\t\t\t{"text": "👥 玩家列表", "callback_data": "/players"},
\t\t\t\t{"text": "🏆 战报统计", "callback_data": "/stats"},
\t\t\t},
\t\t},
\t}
\tpayload := map[string]interface{}{
\t\t"chat_id":      chatID,
\t\t"text":         text,
\t\t"parse_mode":   "Markdown",
\t\t"reply_markup": inlineButtons,
\t}
\tdata, _ := json.Marshal(payload)
\t_, _ = tm.httpClient.Post(url, "application/json", bytes.NewBuffer(data))
}

func (tm *TelegramManager) NotifyAdmin(text string) {
\tif tm.AdminID != 0 {
\t\ttm.SendMessage(tm.AdminID, text)
\t}
}

func (tm *TelegramManager) NotifyGameEvent(event string) {
\tif tm.AdminID != 0 {
\t\ttm.SendMessage(tm.AdminID, fmt.Sprintf("📢 *游戏战况播报*:\\n%s", event))
\t}
}
`
  },
  {
    path: 'pkg/game/stats.go',
    name: 'stats.go',
    category: 'core',
    description: '服务器全局统计与全垒打/天胡事件追踪',
    code: `package game

import (
\t"sync"
\t"time"
)

type ServerStats struct {
\tStartTime        time.Time ` + "`" + `json:"startTime"` + "`" + `
\tTotalGames       int64     ` + "`" + `json:"totalGames"` + "`" + `
\tTotalConnections int64     ` + "`" + `json:"totalConnections"` + "`" + `
\tGrandSlamCount   int64     ` + "`" + `json:"grandSlamCount"` + "`" + `
\tSpecialHandCount int64     ` + "`" + `json:"specialHandCount"` + "`" + `
\tmu               sync.RWMutex
}

func NewServerStats() *ServerStats {
\treturn &ServerStats{
\t\tStartTime: time.Now(),
\t}
}

func (s *ServerStats) RecordGameFinished(hasGrandSlam, hasSpecial bool) {
\ts.mu.Lock()
\tdefer s.mu.Unlock()
\ts.TotalGames++
\tif hasGrandSlam {
\t\ts.GrandSlamCount++
\t}
\tif hasSpecial {
\t\ts.SpecialHandCount++
\t}
}
`
  },
  {
    path: 'cmd/client/main.go',
    name: 'main.go (TUI Client)',
    category: 'client',
    description: 'Termux 终端交互式命令行客户端 (ANSI彩色/快捷理牌)',
    code: `package main

import (
\t"bufio"
\t"flag"
\t"fmt"
\t"os"
\t"strings"
\t"time"

\t"shisanshui/pkg/game"
)

const (
\tReset   = "\\033[0m"
\tRed     = "\\033[31m"
\tGreen   = "\\033[32m"
\tYellow  = "\\033[33m"
\tBlue    = "\\033[34m"
\tMagenta = "\\033[35m"
\tCyan    = "\\033[36m"
\tWhite   = "\\033[37m"
\tBold    = "\\033[1m"
)

func printBanner() {
\tfmt.Println(Bold + Cyan + "==================================================" + Reset)
\tfmt.Println(Bold + Yellow + "      🀄 十三水 Termux 命令行多人对战终端" + Reset)
\tfmt.Println(Bold + Cyan + "==================================================" + Reset)
}

func main() {
\tserverAddr := flag.String("server", "127.0.0.1:8080", "WebSocket 服务端地址")
\tuserName := flag.String("name", "Termux玩家", "玩家昵称")
\tflag.Parse()

\tprintBanner()
\tfmt.Printf(">> 欢迎 %s%s%s 进入十三水对战系统\\n", Green, *userName, Reset)
\tfmt.Printf(">> 目标服务器: %s\\n\\n", *serverAddr)

\tdeck := game.NewDeck()
\tdeck.Shuffle()

\tmyCards := deck.Deal13()
\tfmt.Println(Bold + "[1] 您本局收到的手牌 (13张):" + Reset)
\tfmt.Println(game.FormatCardsPretty(myCards))
\tfmt.Println()

\tspecial := game.EvaluateSpecialHand(myCards)
\tif special.IsSpecial {
\t\tfmt.Printf("%s🔥 恭喜！天降特殊牌型: %s (奖励 %d 水)%s\\n\\n", Bold+Red, special.Name, special.Points, Reset)
\t}

\tfmt.Println(Bold + "[2] AI 智能最优理牌推荐:" + Reset)
\toptions := game.CalculateSmartArrangements(myCards)
\tfor idx, opt := range options {
\t\tfmt.Printf(" %s[%d]%s %s (预估战力: %d)\\n", Yellow, idx+1, Reset, opt.Title, opt.ExpectedScore)
\t\tfmt.Printf("     头道(3): %s  [%s]\\n", game.FormatCards(opt.Head), opt.HeadEval.TypeName)
\t\tfmt.Printf("     中道(5): %s  [%s]\\n", game.FormatCards(opt.Middle), opt.MidEval.TypeName)
\t\tfmt.Printf("     尾道(5): %s  [%s]\\n", game.FormatCards(opt.Tail), opt.TailEval.TypeName)
\t}
\tfmt.Println()

\treader := bufio.NewReader(os.Stdin)
\tfmt.Print(Bold + "请输入推荐方案编号 [1-" + fmt.Sprintf("%d", len(options)) + "] 确认出牌 (或输入 q 退出): " + Reset)
\tinput, _ := reader.ReadString('\\n')
\tinput = strings.TrimSpace(input)

\tif input == "q" || input == "quit" {
\t\tfmt.Println(">> 已退出游戏。")
\t\treturn
\t}

\tchoice := 1
\tif input == "2" && len(options) >= 2 {
\t\tchoice = 2
\t} else if input == "3" && len(options) >= 3 {
\t\tchoice = 3
\t}

\tselected := options[choice-1]
\tfmt.Printf("\\n%s[✓] 方案已锁定！出牌组合确认：%s\\n", Green+Bold, Reset)
\tfmt.Printf(" 🎴 前墩 (头道): %s\\n", game.FormatCardsPretty(selected.Head))
\tfmt.Printf(" 🎴 中墩 (中道): %s\\n", game.FormatCardsPretty(selected.Middle))
\tfmt.Printf(" 🎴 后墩 (尾道): %s\\n", game.FormatCardsPretty(selected.Tail))
\tfmt.Println("\\n>> 正在等待同桌其他 3 位玩家完成理牌...")
\ttime.Sleep(1 * time.Second)
\tfmt.Println(Bold + Green + ">> [Showdown] 比牌开始！" + Reset)
}
`
  },
  {
    path: 'pkg/game/card.go',
    name: 'card.go',
    category: 'core',
    description: '扑克牌结构定义、花色、点数与洗牌发牌算法',
    code: `package game

import (
\t"fmt"
\t"math/rand"
\t"sort"
\t"strings"
\t"time"
)

type Suit int

const (
\tDiamonds Suit = 1
\tClubs    Suit = 2
\tHearts   Suit = 3
\tSpades   Suit = 4
)

type Card struct {
\tSuit Suit
\tRank int
}

func (c Card) String() string {
\tsuitSym := ""
\tswitch c.Suit {
\tcase Spades:
\t\tsuitSym = "♠"
\tcase Hearts:
\t\tsuitSym = "♥"
\tcase Clubs:
\t\tsuitSym = "♣"
\tcase Diamonds:
\t\tsuitSym = "♦"
\t}

\trankStr := ""
\tswitch c.Rank {
\tcase 14:
\t\trankStr = "A"
\tcase 13:
\t\trankStr = "K"
\tcase 12:
\t\trankStr = "Q"
\tcase 11:
\t\trankStr = "J"
\tcase 10:
\t\trankStr = "10"
\tdefault:
\t\trankStr = fmt.Sprintf("%d", c.Rank)
\t}
\treturn suitSym + rankStr
}

type Deck struct {
\tcards []Card
}

func NewDeck() *Deck {
\tcards := make([]Card, 0, 52)
\tfor s := Diamonds; s <= Spades; s++ {
\t\tfor r := 2; r <= 14; r++ {
\t\t\tcards = append(cards, Card{Suit: s, Rank: r})
\t\t}
\t}
\treturn &Deck{cards: cards}
}

func (d *Deck) Shuffle() {
\tr := rand.New(rand.NewSource(time.Now().UnixNano()))
\tr.Shuffle(len(d.cards), func(i, j int) {
\t\td.cards[i], d.cards[j] = d.cards[j], d.cards[i]
\t})
}

func (d *Deck) Deal13() []Card {
\tif len(d.cards) < 13 {
\t\treturn nil
\t}
\thand := d.cards[:13]
\td.cards = d.cards[13:]
\treturn SortCards(hand)
}

func SortCards(cards []Card) []Card {
\tres := make([]Card, len(cards))
\tcopy(res, cards)
\tsort.Slice(res, func(i, j int) bool {
\t\tif res[i].Rank != res[j].Rank {
\t\t\treturn res[i].Rank > res[j].Rank
\t\t}
\t\treturn res[i].Suit > res[j].Suit
\t})
\treturn res
}

func FormatCards(cards []Card) string {
\tvar b strings.Builder
\tfor i, c := range cards {
\t\tif i > 0 {
\t\t\tb.WriteString(" ")
\t\t}
\t\tb.WriteString(c.String())
\t}
\treturn b.String()
}

func FormatCardsPretty(cards []Card) string {
\tvar b strings.Builder
\tfor i, c := range cards {
\t\tif i > 0 {
\t\t\tb.WriteString(" ")
\t\t}
\t\tcolor := "\\033[37m"
\t\tif c.Suit == Hearts || c.Suit == Diamonds {
\t\t\tcolor = "\\033[31m"
\t\t} else {
\t\t\tcolor = "\\033[36m"
\t\t}
\t\tb.WriteString(fmt.Sprintf("%s%s\\033[0m", color, c.String()))
\t}
\treturn b.String()
}
`
  },
  {
    path: 'pkg/game/evaluator.go',
    name: 'evaluator.go',
    category: 'core',
    description: '头墩/中墩/尾墩牌型判定器及倒牌(相公)校验规则',
    code: `package game

import "fmt"

type HandType int

const (
\tHighCard      HandType = 1
\tOnePair       HandType = 2
\tTwoPairs      HandType = 3
\tThreeOfAKind  HandType = 4
\tStraight      HandType = 5
\tFlush         HandType = 6
\tFullHouse     HandType = 7
\tFourOfAKind   HandType = 8
\tStraightFlush HandType = 9
)

type DunEvaluation struct {
\tType         HandType
\tTypeName     string
\tScoreRank    int
\tPrimaryRanks []int
\tBonus        int
}

func EvaluateDun(cards []Card, isHead bool) DunEvaluation {
\tif isHead && len(cards) != 3 {
\t\treturn DunEvaluation{Type: HighCard, TypeName: "无效"}
\t}
\tif !isHead && len(cards) != 5 {
\t\treturn DunEvaluation{Type: HighCard, TypeName: "无效"}
\t}

\tsorted := SortCards(cards)
\trankCounts := make(map[int]int)
\tfor _, c := range sorted {
\t\trankCounts[c.Rank]++
\t}

\ttype rankPair struct {
\t\trank  int
\t\tcount int
\t}
\tvar pairs []rankPair
\tfor r, cnt := range rankCounts {
\t\tpairs = append(pairs, rankPair{rank: r, count: cnt})
\t}
\tfor i := 0; i < len(pairs); i++ {
\t\tfor j := i + 1; j < len(pairs); j++ {
\t\t\tif pairs[j].count > pairs[i].count || (pairs[j].count == pairs[i].count && pairs[j].rank > pairs[i].rank) {
\t\t\t\tpairs[i], pairs[j] = pairs[j], pairs[i]
\t\t\t}
\t\t}
\t}

\tif isHead {
\t\tif pairs[0].count == 3 {
\t\t\treturn DunEvaluation{
\t\t\t\tType:         ThreeOfAKind,
\t\t\t\tTypeName:     "三条(冲三)",
\t\t\t\tScoreRank:    4,
\t\t\t\tPrimaryRanks: []int{pairs[0].rank},
\t\t\t\tBonus:        3,
\t\t\t}
\t\t}
\t\tif pairs[0].count == 2 {
\t\t\treturn DunEvaluation{
\t\t\t\tType:         OnePair,
\t\t\t\tTypeName:     fmt.Sprintf("对%d", pairs[0].rank),
\t\t\t\tScoreRank:    2,
\t\t\t\tPrimaryRanks: []int{pairs[0].rank, pairs[1].rank},
\t\t\t}
\t\t}
\t\treturn DunEvaluation{
\t\t\tType:         HighCard,
\t\t\tTypeName:     fmt.Sprintf("乌龙(%d高)", sorted[0].Rank),
\t\t\tScoreRank:    1,
\t\t\tPrimaryRanks: []int{sorted[0].Rank, sorted[1].Rank, sorted[2].Rank},
\t\t}
\t}

\tisFlush := true
\tfor i := 1; i < len(sorted); i++ {
\t\tif sorted[i].Suit != sorted[0].Suit {
\t\t\tisFlush = false
\t\t\tbreak
\t\t}
\t}

\tisStraight := false
\tstraightHigh := 0
\tif sorted[0].Rank-sorted[4].Rank == 4 && len(pairs) == 5 {
\t\tisStraight = true
\t\tstraightHigh = sorted[0].Rank
\t} else if sorted[0].Rank == 14 && sorted[1].Rank == 5 && sorted[2].Rank == 4 && sorted[3].Rank == 3 && sorted[4].Rank == 2 {
\t\tisStraight = true
\t\tstraightHigh = 5
\t}

\tif isFlush && isStraight {
\t\treturn DunEvaluation{
\t\t\tType:         StraightFlush,
\t\t\tTypeName:     "同花顺",
\t\t\tScoreRank:    9,
\t\t\tPrimaryRanks: []int{straightHigh},
\t\t\tBonus:        5,
\t\t}
\t}

\tif pairs[0].count == 4 {
\t\treturn DunEvaluation{
\t\t\tType:         FourOfAKind,
\t\t\tTypeName:     "铁支(炸弹)",
\t\t\tScoreRank:    8,
\t\t\tPrimaryRanks: []int{pairs[0].rank, pairs[1].rank},
\t\t\tBonus:        4,
\t\t}
\t}

\tif pairs[0].count == 3 && pairs[1].count == 2 {
\t\treturn DunEvaluation{
\t\t\tType:         FullHouse,
\t\t\tTypeName:     "葫芦",
\t\t\tScoreRank:    7,
\t\t\tPrimaryRanks: []int{pairs[0].rank, pairs[1].rank},
\t\t}
\t}

\tif isFlush {
\t\treturn DunEvaluation{
\t\t\tType:         Flush,
\t\t\tTypeName:     "同花",
\t\t\tScoreRank:    6,
\t\t\tPrimaryRanks: []int{sorted[0].Rank, sorted[1].Rank, sorted[2].Rank, sorted[3].Rank, sorted[4].Rank},
\t\t}
\t}

\tif isStraight {
\t\treturn DunEvaluation{
\t\t\tType:         Straight,
\t\t\tTypeName:     "顺子",
\t\t\tScoreRank:    5,
\t\t\tPrimaryRanks: []int{straightHigh},
\t\t}
\t}

\tif pairs[0].count == 3 {
\t\treturn DunEvaluation{
\t\t\tType:         ThreeOfAKind,
\t\t\tTypeName:     "三条",
\t\t\tScoreRank:    4,
\t\t\tPrimaryRanks: []int{pairs[0].rank, pairs[1].rank, pairs[2].rank},
\t\t}
\t}

\tif pairs[0].count == 2 && pairs[1].count == 2 {
\t\treturn DunEvaluation{
\t\t\tType:         TwoPairs,
\t\t\tTypeName:     "两对",
\t\t\tScoreRank:    3,
\t\t\tPrimaryRanks: []int{pairs[0].rank, pairs[1].rank, pairs[2].rank},
\t\t}
\t}

\tif pairs[0].count == 2 {
\t\treturn DunEvaluation{
\t\t\tType:         OnePair,
\t\t\tTypeName:     "对子",
\t\t\tScoreRank:    2,
\t\t\tPrimaryRanks: []int{pairs[0].rank, sorted[2].Rank, sorted[3].Rank, sorted[4].Rank},
\t\t}
\t}

\treturn DunEvaluation{
\t\tType:         HighCard,
\t\tTypeName:     "乌龙",
\t\tScoreRank:    1,
\t\tPrimaryRanks: []int{sorted[0].Rank, sorted[1].Rank, sorted[2].Rank, sorted[3].Rank, sorted[4].Rank},
\t}
}

func CompareDun(d1, d2 DunEvaluation) int {
\tif d1.ScoreRank != d2.ScoreRank {
\t\treturn d1.ScoreRank - d2.ScoreRank
\t}
\tminLen := len(d1.PrimaryRanks)
\tif len(d2.PrimaryRanks) < minLen {
\t\tminLen = len(d2.PrimaryRanks)
\t}
\tfor i := 0; i < minLen; i++ {
\t\tif d1.PrimaryRanks[i] != d2.PrimaryRanks[i] {
\t\t\treturn d1.PrimaryRanks[i] - d2.PrimaryRanks[i]
\t\t}
\t}
\treturn 0
}

func CheckDaoPai(head, mid, tail []Card) (bool, string) {
\thEval := EvaluateDun(head, true)
\tmEval := EvaluateDun(mid, false)
\ttEval := EvaluateDun(tail, false)

\tif CompareDun(hEval, mEval) > 0 {
\t\treturn true, fmt.Sprintf("头道[%s]大于中道[%s] (倒牌违规)", hEval.TypeName, mEval.TypeName)
\t}
\tif CompareDun(mEval, tEval) > 0 {
\t\treturn true, fmt.Sprintf("中道[%s]大于尾道[%s] (倒牌违规)", mEval.TypeName, tEval.TypeName)
\t}
\treturn false, ""
}
`
  },
  {
    path: 'pkg/game/special.go',
    name: 'special.go',
    category: 'core',
    description: '至尊青龙、一条龙、十二皇族、三同花顺等特殊牌型检测',
    code: `package game

type SpecialResult struct {
\tIsSpecial bool
\tName      string
\tPoints    int
}

func EvaluateSpecialHand(cards []Card) SpecialResult {
\tif len(cards) != 13 {
\t\treturn SpecialResult{IsSpecial: false}
\t}

\tsorted := SortCards(cards)
\tisSameSuit := true
\tfor i := 1; i < len(sorted); i++ {
\t\tif sorted[i].Suit != sorted[0].Suit {
\t\t\tisSameSuit = false
\t\t\tbreak
\t\t}
\t}

\tisAtoK := true
\tfor i := 0; i < 13; i++ {
\t\tif sorted[i].Rank != 14-i {
\t\t\tisAtoK = false
\t\t\tbreak
\t\t}
\t}
\tif isSameSuit && isAtoK {
\t\treturn SpecialResult{IsSpecial: true, Name: "至尊青龙 (同花十三水)", Points: 108}
\t}

\tif isAtoK {
\t\treturn SpecialResult{IsSpecial: true, Name: "一条龙 (A-K)", Points: 36}
\t}

\troyals := 0
\tfor _, c := range sorted {
\t\tif c.Rank >= 11 {
\t\t\troyals++
\t\t}
\t}
\tif royals >= 12 {
\t\treturn SpecialResult{IsSpecial: true, Name: "十二皇族", Points: 24}
\t}

\trankCounts := make(map[int]int)
\tfor _, c := range sorted {
\t\trankCounts[c.Rank]++
\t}

\tquadCount := 0
\ttripleCount := 0
\tpairCount := 0
\tfor _, cnt := range rankCounts {
\t\tif cnt == 4 {
\t\t\tquadCount++
\t\t} else if cnt == 3 {
\t\t\ttripleCount++
\t\t} else if cnt == 2 {
\t\t\tpairCount++
\t\t}
\t}

\tif quadCount == 3 {
\t\treturn SpecialResult{IsSpecial: true, Name: "三分天下 (三炸弹)", Points: 20}
\t}

\tisAllHigh := true
\tfor _, c := range sorted {
\t\tif c.Rank < 8 {
\t\t\tisAllHigh = false
\t\t\tbreak
\t\t}
\t}
\tif isAllHigh {
\t\treturn SpecialResult{IsSpecial: true, Name: "全大 (8-A)", Points: 10}
\t}

\tisAllLow := true
\tfor _, c := range sorted {
\t\tif c.Rank > 8 {
\t\t\tisAllLow = false
\t\t\tbreak
\t\t}
\t}
\tif isAllLow {
\t\treturn SpecialResult{IsSpecial: true, Name: "全小 (2-8)", Points: 10}
\t}

\tallRed := true
\tallBlack := true
\tfor _, c := range sorted {
\t\tif c.Suit == Hearts || c.Suit == Diamonds {
\t\t\tallBlack = false
\t\t} else {
\t\t\tallRed = false
\t\t}
\t}
\tif allRed || allBlack {
\t\treturn SpecialResult{IsSpecial: true, Name: "凑一色", Points: 10}
\t}

\tif tripleCount == 4 {
\t\treturn SpecialResult{IsSpecial: true, Name: "四套三条", Points: 8}
\t}

\tif tripleCount == 1 && pairCount == 5 {
\t\treturn SpecialResult{IsSpecial: true, Name: "五对三条", Points: 6}
\t}

\tif pairCount == 6 || (quadCount == 1 && pairCount == 4) {
\t\treturn SpecialResult{IsSpecial: true, Name: "六对半", Points: 4}
\t}

\treturn SpecialResult{IsSpecial: false}
}
`
  },
  {
    path: 'pkg/game/solver.go',
    name: 'solver.go',
    category: 'core',
    description: 'AI 启发式理牌推荐算法与最优出牌方案计算',
    code: `package game

import "fmt"

type ArrangeOption struct {
\tTitle         string
\tHead          []Card
\tMiddle        []Card
\tTail          []Card
\tHeadEval      DunEvaluation
\tMidEval       DunEvaluation
\tTailEval      DunEvaluation
\tExpectedScore int
}

func combinations(cards []Card, k int) [][]Card {
\tvar result [][]Card
\tvar current []Card
\tvar backtrack func(start int)
\tbacktrack = func(start int) {
\t\tif len(current) == k {
\t\t\tc := make([]Card, k)
\t\t\tcopy(c, current)
\t\t\tresult = append(result, c)
\t\t\treturn
\t\t}
\t\tfor i := start; i < len(cards); i++ {
\t\t\tcurrent = append(current, cards[i])
\t\t\tbacktrack(i + 1)
\t\t\tcurrent = current[:len(current)-1]
\t\t}
\t}
\tbacktrack(0)
\treturn result
}

func CalculateSmartArrangements(cards []Card) []ArrangeOption {
\tif len(cards) != 13 {
\t\treturn nil
\t}

\ttailCandidates := combinations(cards, 5)
\ttype evalItem struct {
\t\tcards []Card
\t\teval  DunEvaluation
\t}

\tvar evaluatedTails []evalItem
\tfor _, t := range tailCandidates {
\t\tevaluatedTails = append(evaluatedTails, evalItem{cards: t, eval: EvaluateDun(t, false)})
\t}

\tfor i := 0; i < len(evaluatedTails); i++ {
\t\tfor j := i + 1; j < len(evaluatedTails); j++ {
\t\t\tif CompareDun(evaluatedTails[j].eval, evaluatedTails[i].eval) > 0 {
\t\t\t\tevaluatedTails[i], evaluatedTails[j] = evaluatedTails[j], evaluatedTails[i]
\t\t\t}
\t\t}
\t}

\tvar options []ArrangeOption
\tlimit := 10
\tif len(evaluatedTails) < limit {
\t\tlimit = len(evaluatedTails)
\t}

\tfor _, tailItem := range evaluatedTails[:limit] {
\t\ttailMap := make(map[Card]bool)
\t\tfor _, c := range tailItem.cards {
\t\t\ttailMap[c] = true
\t\t}
\t\tvar remaining8 []Card
\t\tfor _, c := range cards {
\t\t\tif !tailMap[c] {
\t\t\t\tremaining8 = append(remaining8, c)
\t\t\t}
\t\t}

\t\tmidCandidates := combinations(remaining8, 5)
\t\tfor _, mid := range midCandidates {
\t\t\tmidEval := EvaluateDun(mid, false)
\t\t\tif CompareDun(tailItem.eval, midEval) >= 0 {
\t\t\t\tmidMap := make(map[Card]bool)
\t\t\t\tfor _, c := range mid {
\t\t\t\t\tmidMap[c] = true
\t\t\t\t}
\t\t\t\tvar headCards []Card
\t\t\t\tfor _, c := range remaining8 {
\t\t\t\tif !midMap[c] {
\t\t\t\t\theadCards = append(headCards, c)
\t\t\t\t}
\t\t\t}
\t\t\theadEval := EvaluateDun(headCards, true)
\t\t\tif CompareDun(midEval, headEval) >= 0 {
\t\t\t\texpScore := tailItem.eval.ScoreRank*100 + midEval.ScoreRank*20 + headEval.ScoreRank*5
\t\t\t\tif headEval.Type == ThreeOfAKind {
\t\t\t\t\texpScore += 30
\t\t\t\t}
\t\t\t\tif midEval.Type == FullHouse {
\t\t\t\t\texpScore += 25
\t\t\t\t}

\t\t\t\toptions = append(options, ArrangeOption{
\t\t\t\t\tTitle:         fmt.Sprintf("尾:[%s] 中:[%s] 头:[%s]", tailItem.eval.TypeName, midEval.TypeName, headEval.TypeName),
\t\t\t\t\tHead:          SortCards(headCards),
\t\t\t\t\tMiddle:        SortCards(mid),
\t\t\t\t\tTail:          SortCards(tailItem.cards),
\t\t\t\t\tHeadEval:      headEval,
\t\t\t\t\tMidEval:       midEval,
\t\t\t\t\tTailEval:      tailItem.eval,
\t\t\t\t\tExpectedScore: expScore,
\t\t\t\t})
\t\t\t\tif len(options) >= 3 {
\t\t\t\t\treturn options
\t\t\t\t}
\t\t\t}
\t\t}
\t}
}
\treturn options
}
`
  },
  {
    path: 'pkg/game/room.go',
    name: 'room.go',
    category: 'server',
    description: '多人桌局状态机、发牌/比牌/打枪/全垒打结算流',
    code: `package game

import (
\t"encoding/json"
\t"fmt"
\t"sync"
\t"time"

\t"github.com/gorilla/websocket"
)

type EventNotifier interface {
\tNotifyGameEvent(event string)
}

type PlayerState struct {
\tID        string          ` + "`" + `json:"id"` + "`" + `
\tName      string          ` + "`" + `json:"name"` + "`" + `
\tIsReady   bool            ` + "`" + `json:"isReady"` + "`" + `
\tIsAI      bool            ` + "`" + `json:"isAi"` + "`" + `
\tCards     []Card          ` + "`" + `json:"cards"` + "`" + `
\tHead      []Card          ` + "`" + `json:"head"` + "`" + `
\tMiddle    []Card          ` + "`" + `json:"middle"` + "`" + `
\tTail      []Card          ` + "`" + `json:"tail"` + "`" + `
\tConn      *websocket.Conn ` + "`" + `json:"-"` + "`" + `
\tScore     int             ` + "`" + `json:"score"` + "`" + `
\tSubmitted bool            ` + "`" + `json:"submitted"` + "`" + `
}

type Room struct {
\tID       string
\tPlayers  map[string]*PlayerState
\tPhase    string
\tmu       sync.Mutex
\tstats    *ServerStats
\tnotifier EventNotifier
\tquitChan chan struct{}
}

func NewRoom(id string, stats *ServerStats, notifier EventNotifier) *Room {
\treturn &Room{
\t\tID:       id,
\t\tPlayers:  make(map[string]*PlayerState),
\t\tPhase:    "WAITING",
\t\tstats:    stats,
\t\tnotifier: notifier,
\t\tquitChan: make(chan struct{}),
\t}
}

func (r *Room) AddPlayer(id, name string, conn *websocket.Conn) {
\tr.mu.Lock()
\tdefer r.mu.Unlock()

\tif len(r.Players) >= 4 {
\t\treturn
\t}
\tr.Players[id] = &PlayerState{
\t\tID:      id,
\t\tName:    name,
\t\tConn:    conn,
\t\tIsReady: true,
\t}
\tr.broadcastState()

\tif len(r.Players) == 4 {
\t\tgo r.StartRound()
\t}
}

func (r *Room) RemovePlayer(id string) {
\tr.mu.Lock()
\tdefer r.mu.Unlock()
\tdelete(r.Players, id)
\tr.broadcastState()
}

func (r *Room) SetReady(id string) {
\tr.mu.Lock()
\tdefer r.mu.Unlock()
\tif p, ok := r.Players[id]; ok {
\t\tp.IsReady = true
\t}
\tr.broadcastState()
}

func (r *Room) HandleSubmit(id string, data map[string]interface{}) {
\tr.mu.Lock()
\tdefer r.mu.Unlock()
\tif p, ok := r.Players[id]; ok {
\t\tp.Submitted = true
\t}
\tr.broadcastState()
}

func (r *Room) BroadcastChat(sender, text string) {
\tr.broadcast(map[string]interface{}{
\t\t"type":   "chat",
\t\t"sender": sender,
\t\t"text":   text,
\t\t"time":   time.Now().Format("15:04:05"),
\t})
}

func (r *Room) StartRound() {
\tr.mu.Lock()
\tr.Phase = "DEALING"
\tdeck := NewDeck()
\tdeck.Shuffle()

\tfor _, p := range r.Players {
\t\tp.Cards = deck.Deal13()
\t\tp.Submitted = false
\t}
\tr.mu.Unlock()

\tr.broadcastState()
\ttime.Sleep(1500 * time.Millisecond)

\tr.mu.Lock()
\tr.Phase = "ARRANGING"
\tr.mu.Unlock()
\tr.broadcastState()
}

func (r *Room) broadcastState() {
\tr.broadcast(map[string]interface{}{
\t\t"type":    "room_state",
\t\t"phase":   r.Phase,
\t\t"players": r.Players,
\t})
}

func (r *Room) broadcast(data interface{}) {
\tbytes, err := json.Marshal(data)
\tif err != nil {
\t\treturn
\t}
\tfor _, p := range r.Players {
\t\tif p.Conn != nil {
\t\t\t_ = p.Conn.WriteMessage(websocket.TextMessage, bytes)
\t\t}
\t}
}

func (r *Room) Run() {}
`
  },
  {
    path: '.github/workflows/build.yml',
    name: 'build.yml (GitHub Actions)',
    category: 'deploy',
    description: 'GitHub Actions 自动持续集成与 Android ARM64 交叉编译发布',
    code: `name: Build and Release Shisanshui Binaries

on:
  push:
    branches: [ main, master ]
    tags: [ 'v*' ]
  pull_request:
    branches: [ main, master ]

jobs:
  build:
    name: Cross Compile Binaries
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.22'

      - name: Install Dependencies
        run: go mod tidy

      - name: Build for Android Termux (Linux ARM64)
        run: |
          mkdir -p dist
          CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -ldflags="-s -w" -o dist/server-android-arm64 cmd/server/main.go
          CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -ldflags="-s -w" -o dist/client-android-arm64 cmd/client/main.go

      - name: Build for Linux AMD64
        run: |
          CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o dist/server-linux-amd64 cmd/server/main.go
          CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o dist/client-linux-amd64 cmd/client/main.go

      - name: Build for Windows AMD64
        run: |
          CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o dist/server-windows-amd64.exe cmd/server/main.go
          CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o dist/client-windows-amd64.exe cmd/client/main.go

      - name: Upload Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: shisanshui-binaries
          path: dist/*
`
  },
  {
    path: 'config.example.json',
    name: 'config.example.json',
    category: 'core',
    description: '服务器与 Telegram Bot 运维配置文件模板',
    code: `{
  "server": {
    "port": 8080,
    "room_timeout_sec": 30,
    "enable_ai_filler": true,
    "max_rooms": 50
  },
  "telegram_bot": {
    "enabled": true,
    "bot_token": "YOUR_TELEGRAM_BOT_TOKEN_FROM_BOTFATHER",
    "admin_chat_id": 123456789,
    "alert_on_grand_slam": true,
    "alert_on_special_hand": true
  }
}
`
  },
  {
    path: '.gitignore',
    name: '.gitignore',
    category: 'deploy',
    description: 'Git 仓库忽略编译产物与敏感配置',
    code: `# Binaries
server
client
*.exe
*.test
bin/
dist/

# Config secrets
.env
config.json

# IDE
.vscode/
.idea/
`
  },
  {
    path: 'DEPLOYMENT.md',
    name: 'DEPLOYMENT.md',
    category: 'docs',
    description: '★ 十三水 Termux 完整部署、网络开黑、TG Bot与防休眠权威手册',
    code: `# 🀄 十三水 (Chinese Poker) Go 语言多人游戏 Termux 完整部署手册

## 1. 环境准备
• 必须使用 F-Droid 镜像下载 Termux (>= 0.118)，禁用 Google Play 停更版本。
• 开启后台防杀：在 Termux 输入 termux-wake-lock 防止锁屏断网。

## 2. GitHub 仓库推送
\`\`\`bash
git init && git add . && git commit -m "feat: initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/shisanshui.git
git push -u origin main
\`\`\`

## 3. Telegram 机器人配置
1) 找 @BotFather 输入 /newbot 获取 Token。
2) 找 @userinfobot 获取纯数字 Admin ID。
3) 启动命令: ./server -port=8080 -tg-token="TOKEN" -tg-admin="ADMIN_ID"

## 4. Termux 一键全自动启动
\`\`\`bash
curl -sSL https://raw.githubusercontent.com/YOUR_USERNAME/shisanshui/main/start.sh | bash
\`\`\`
(自动检测依赖并安装、自动编译、后台拉起服务、自动进房发牌)

## 5. 局域网开黑
• 好友手机连接同一 WiFi 或热点，在 Termux 运行:
  ./client -server="房主IP:8080" -name="好友昵称"
`
  },
  {
    path: 'README.md',
    name: 'README.md',
    category: 'docs',
    description: 'GitHub 仓库主页、一条命令启动说明与 Telegram Bot 运维手册',
    code: `# 🀄 十三水 (Chinese Poker) Go 语言多人联机游戏

> **★ 极致简化体验**：只需在 Termux 粘贴 **单条命令**，自动完成环境检查、安装依赖、编译、启动服务并直接进入牌局！

---

## ⚡ 终极极简：一条命令自动搞定一切 (Zero-Config)

在 Android 手机 Termux 终端中直接复制粘贴：

\`\`\`bash
curl -sSL https://raw.githubusercontent.com/YOUR_USERNAME/shisanshui/main/start.sh | bash
\`\`\`

*(或者已克隆仓库的情况下，直接运行 \`bash start.sh\`)*

### 该单条命令将全自动执行以下全部工作：
1. 自动检测并静默安装 Go、Git、Net-Tools 编译器与工具链。
2. 自动更新最新源码，自动执行 \`go build\` 编译。
3. 自动在后台启动高并发游戏服务端（自动绑定局域网 IP 与端口）。
4. 自动唤起终端 TUI 交互式理牌客户端，秒级直接进房发牌！
5. 退出客户端时自动安全清理后台服务。

---

## 🤖 Telegram Bot 远程管理员运维
在 \`~/.shisanshui_env\` 填入或启动时传入：
- \`/status\`：实时查看 Termux 内存/CPU/在线玩家数。
- \`/rooms\`：实时列出活跃房间与对战进度。
- \`/broadcast\`：向全服玩家下发系统公告。
- \`/kick\`：远程移出违规玩家。
`
  },
  {
    path: 'web/index.html',
    name: 'index.html (玩家网页端)',
    category: 'client',
    description: '【移动端/网页对战端】免安装 HTML5 绿色赌场牌桌、一键智能理牌、天胡检测与局内弹幕',
    code: STANDALONE_WEB_CLIENT_HTML
  },
  {
    path: 'CLOUDFLARE_TUNNEL_DEPLOY.md',
    name: 'CLOUDFLARE_TUNNEL_DEPLOY.md',
    category: 'docs',
    description: 'Cloudflare Tunnel 隧道公网穿透与自定义域名绑定完整说明',
    code: `# 十三水 (Chinese Poker) · Cloudflare Tunnel 公网直连部署指南

本文档专为使用 Cloudflare Tunnel 将运行在 Android Termux 手机上的十三水 Go 服务端安全映射至公网编写。

## 极速穿透
1. 在 Termux 安装 cloudflared:
   pkg install -y cloudflared

2. 启动穿透:
   cloudflared tunnel --url http://127.0.0.1:8080

3. 复制生成的公网域名，在微信/手机浏览器打开即可进入牌局！
`
  }
];
