/**
 * PM2 进程守护配置文件 (支持 Linux VPS 与 Serv00)
 * 启动命令：pm2 start ecosystem.config.cjs
 * 查看状态：pm2 status
 * 查看日志：pm2 logs shisanshui
 */

module.exports = {
  apps: [
    {
      name: 'shisanshui',
      script: './server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '220M', // Serv00 严格限制 512M，设置 220M 阈值防止被系统强杀
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 8080,
        HOST: '0.0.0.0'
      },
      node_args: '--max-old-space-size=256'
    },
    {
      name: 'shisanshui-bot',
      script: './scripts/tgBot.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '100M',
      env: {
        NODE_ENV: 'production'
      },
      node_args: '--max-old-space-size=128'
    }
  ]
};
