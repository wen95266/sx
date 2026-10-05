import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

function roomServerPlugin() {
  const roomsMemory: Record<string, any> = {};

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
              const {
                roomId = 'room_realtime_4',
                maxPlayers = 4,
                userId,
                nickname,
                avatar,
                phone,
                targetSeatIndex,
                isSubmitted,
                arrangement,
                action,
                dealtCardsMap
              } = body;

              if (!roomsMemory[roomId]) {
                roomsMemory[roomId] = {
                  roomId,
                  maxPlayers,
                  seats: Array(maxPlayers).fill(null),
                  chatBubbles: [],
                  phase: 'WAITING',
                  dealerUserId: null,
                  lastUpdated: Date.now()
                };
              }

              const room = roomsMemory[roomId];
              room.maxPlayers = maxPlayers;

              // Expand or adjust seats array if maxPlayers changed
              if (room.seats.length !== maxPlayers) {
                const old = room.seats;
                room.seats = Array(maxPlayers).fill(null);
                for (let i = 0; i < Math.min(old.length, maxPlayers); i++) {
                  room.seats[i] = old[i];
                }
              }

              const now = Date.now();

              // Clean up players inactive for > 15s
              for (let i = 0; i < maxPlayers; i++) {
                if (room.seats[i] && now - room.seats[i].lastSeen > 15000) {
                  room.seats[i] = null;
                }
              }

              // Handle leave
              if (action === 'leave' && userId) {
                for (let i = 0; i < maxPlayers; i++) {
                  if (room.seats[i]?.id === userId) {
                    room.seats[i] = null;
                  }
                }
              } else if (userId) {
                // Find if user already seated
                let existingSeatIndex = room.seats.findIndex((s: any) => s && s.id === userId);

                if (existingSeatIndex === -1 && typeof targetSeatIndex === 'number' && targetSeatIndex >= 0 && targetSeatIndex < maxPlayers) {
                  // If specified seat is free, sit there
                  if (!room.seats[targetSeatIndex]) {
                    existingSeatIndex = targetSeatIndex;
                  }
                }

                // Fallback: if not seated and target is taken or not specified, pick first free seat
                if (existingSeatIndex === -1 && action === 'join') {
                  existingSeatIndex = room.seats.findIndex((s: any) => s === null);
                }

                if (existingSeatIndex !== -1) {
                  const existing = room.seats[existingSeatIndex] || {};
                  room.seats[existingSeatIndex] = {
                    id: userId,
                    name: nickname || '玩家',
                    avatar: avatar || '😎',
                    phone,
                    seatIndex: existingSeatIndex,
                    isAi: false,
                    isReady: true,
                    isSubmitted: isSubmitted ?? existing.isSubmitted ?? false,
                    arrangement: arrangement || existing.arrangement || { head: [], middle: [], tail: [], isDaoPai: false },
                    cards: dealtCardsMap?.[userId] || existing.cards || [],
                    lastSeen: now
                  };
                }
              }

              // Count active seated real players
              const activeSeats = room.seats.filter((s: any) => s !== null);
              const realPlayersCount = activeSeats.length;

              // Ensure host designation (first seated real player is host)
              let hostUserId = null;
              if (activeSeats.length > 0) {
                // Keep existing host if still present, or pick first seated player
                const currentHost = activeSeats.find((s: any) => s.isHost);
                if (currentHost) {
                  hostUserId = currentHost.id;
                } else {
                  activeSeats[0].isHost = true;
                  hostUserId = activeSeats[0].id;
                }
              }

              // Ensure all players have correct isHost flag
              for (let i = 0; i < maxPlayers; i++) {
                if (room.seats[i]) {
                  room.seats[i].isHost = room.seats[i].id === hostUserId;
                }
              }

              // Update room phase
              if (realPlayersCount < 2) {
                room.phase = 'WAITING';
              } else if (action === 'dealCards') {
                room.phase = 'ARRANGING';
                room.dealerUserId = userId;
                if (dealtCardsMap) {
                  for (let i = 0; i < maxPlayers; i++) {
                    if (room.seats[i] && dealtCardsMap[room.seats[i].id]) {
                      room.seats[i].cards = dealtCardsMap[room.seats[i].id];
                      room.seats[i].isSubmitted = false;
                    }
                  }
                }
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                roomId,
                maxPlayers,
                realPlayersCount,
                hostUserId,
                phase: room.phase,
                seats: room.seats,
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
      dedupe: ['react', 'react-dom'],
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
