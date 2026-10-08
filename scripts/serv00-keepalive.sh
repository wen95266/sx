#!/usr/bin/env bash
# ========================================================
# 🀄 Serv00 (FreeBSD) 自动保活与故障自愈脚本
# 使用方法：
# 1. 赋予执行权限：chmod +x scripts/serv00-keepalive.sh
# 2. 加入 crontab 定时任务 (每 5 分钟检测一次)：
#    crontab -e
#    添加行：*/5 * * * * /usr/home/你的用户名/sx/scripts/serv00-keepalive.sh >/dev/null 2>&1
# ========================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR" || exit 1

# 加载 .env 环境变量
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
fi

PORT="${PORT:-8080}"
NODE_BIN=$(which node || echo "/usr/local/bin/node")

# 检查 server.js 进程是否在运行
PID=$(pgrep -f "server.js" | head -n 1)

if [ -z "$PID" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ 检测到十三水服务未运行，正在启动服务 (端口: $PORT)..." >> "$SCRIPT_DIR/keepalive.log"
  nohup "$NODE_BIN" --max-old-space-size=256 server.js > "$SCRIPT_DIR/server.log" 2>&1 &
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ 服务已启动，PID: $!" >> "$SCRIPT_DIR/keepalive.log"
else
  # 进程存在，可选进一步通过 curl 探测健康接口
  if command -v curl >/dev/null 2>&1; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$PORT/health" || true)
    if [ "$HTTP_CODE" != "200" ]; then
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ 服务端口 $PORT 无响应 (HTTP $HTTP_CODE)，正在重启..." >> "$SCRIPT_DIR/keepalive.log"
      kill -9 "$PID" 2>/dev/null || true
      sleep 2
      nohup "$NODE_BIN" --max-old-space-size=256 server.js > "$SCRIPT_DIR/server.log" 2>&1 &
    fi
  fi
fi
