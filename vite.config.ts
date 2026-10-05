import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

function roomServerPlugin() {
  const roomsMemory: Record<string, any> = {};

  const DEFAULT_BOTS_4 = [
    { id: 'bot_zhiduoxing', name: '智多星', avatar: '🤖' },
    { id: 'bot_dongfang', name: '东方雀圣', avatar: '🧙' },
    { id: 'bot_ximen', name: '西门吹水', avatar: '🐉' },
    { id: 'bot_beiming', name: '北冥神手', avatar: '🥷' }
  ];

  const DEFAULT_BOTS_8 = [
    { id: 'bot_zhiduoxing', name: '智多星', avatar: '🤖' },
    { id: 'bot_dongfang', name: '东方雀圣', avatar: '🧙' },
    { id: 'bot_ximen', name: '西门吹水', avatar: '🐉' },
    { id: 'bot_beiming', name: '北冥神手', avatar: '🥷' },
    { id: 'bot_quewang', name: '雀王争霸', avatar: '🦁' },
    { id: 'bot_shisan', name: '十三太保', avatar: '🐲' },
    { id: 'bot_dugu', name: '独孤求胜', avatar: '🦹' },
    { id: 'bot_jiutian', name: '九天玄女', avatar: '👧' }
  ];

  return {
    name: 'room-server-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (!req.url?.startsWith('/api/room')) return next();

        let bodyStr = '';
        req.on('data', (chunk: any) => { bodyStr += chunk; });
        req.on('end', () => {
          try {
            const body = bodyStr ? JSON.parse(bodyStr) : {};

            if (req.url === '/api/room/sync' && req.method === 'POST') {
              const { roomId = 'room_realtime_4', maxPlayers = 4, userId, nickname, avatar, phone, isSubmitted, arrangement, action } = body;

              if (!roomsMemory[roomId]) {
                roomsMemory[roomId] = {
                  roomId,
                  maxPlayers,
                  realPlayersMap: {},
                  chatBubbles: [],
                  lastUpdated: Date.now()
                };
              }

              const room = roomsMemory[roomId];
              room.maxPlayers = maxPlayers;

              const now = Date.now();
              // Clean up players inactive for > 15s
              for (const pid in room.realPlayersMap) {
                if (now - room.realPlayersMap[pid].lastSeen > 15000) {
                  delete room.realPlayersMap[pid];
                }
              }

              if (action === 'leave' && userId) {
                delete room.realPlayersMap[userId];
              } else if (userId) {
                const existing = room.realPlayersMap[userId] || {};
                room.realPlayersMap[userId] = {
                  id: userId,
                  name: nickname || '玩家',
                  avatar: avatar || '😎',
                  phone,
                  isAi: false,
                  isReady: true,
                  isSubmitted: isSubmitted ?? existing.isSubmitted ?? false,
                  arrangement: arrangement || existing.arrangement || { head: [], middle: [], tail: [], isDaoPai: false },
                  lastSeen: now
                };
              }

              const realPlayers = Object.values(room.realPlayersMap) as any[];
              const botsPool = maxPlayers === 8 ? DEFAULT_BOTS_8 : DEFAULT_BOTS_4;
              const fullPlayers = [];

              for (let i = 0; i < maxPlayers; i++) {
                if (i < realPlayers.length) {
                  fullPlayers.push({ ...realPlayers[i], seatIndex: i });
                } else {
                  const bTemplate = botsPool[(i - realPlayers.length) % botsPool.length];
                  fullPlayers.push({
                    id: `bot_${roomId}_seat${i}`,
                    name: bTemplate.name,
                    avatar: bTemplate.avatar,
                    isAi: true,
                    seatIndex: i,
                    isReady: true,
                    isSubmitted: true,
                    arrangement: { head: [], middle: [], tail: [], isDaoPai: false },
                    lastSeen: now
                  });
                }
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                roomId,
                maxPlayers,
                realPlayersCount: realPlayers.length,
                players: fullPlayers,
                chatBubbles: room.chatBubbles || [],
                lastUpdated: now
              }));
              return;
            }

            if (req.url === '/api/room/chat' && req.method === 'POST') {
              const { roomId = 'room_realtime_4', senderId, senderName, text, type, audioBlobUrl, duration } = body;
              if (roomsMemory[roomId]) {
                const bubble = {
                  id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                  senderId,
                  senderName,
                  text,
                  type: type || 'text',
                  audioBlobUrl,
                  duration,
                  timestamp: Date.now()
                };
                if (!roomsMemory[roomId].chatBubbles) roomsMemory[roomId].chatBubbles = [];
                roomsMemory[roomId].chatBubbles.push(bubble);
                if (roomsMemory[roomId].chatBubbles.length > 20) {
                  roomsMemory[roomId].chatBubbles = roomsMemory[roomId].chatBubbles.slice(-20);
                }
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
              return;
            }

            next();
          } catch (e) {
            console.error('Room API error', e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
          }
        });
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      roomServerPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          id: '/',
          name: '十三水多人竞技对战',
          short_name: '十三水',
          description: '经典十三水多人竞技系统，支持四人/八人对战、智能理牌算法、水数互赠与战绩复盘。',
          theme_color: '#0B1120',
          background_color: '#0B1120',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
        },
        devOptions: {
          enabled: true
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname ?? '.', '.'),
      },
    },
    server: {
      // Allow Cloudflare Tunnel domains
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
