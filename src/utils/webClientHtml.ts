// Standalone, Zero-Dependency HTML5/CSS3/Vanilla JS Thirteen Cards Web Game Client
// Embedded directly inside Go server binary and served at GET /

export const STANDALONE_WEB_CLIENT_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>十三水 (Chinese Poker) · 多人对战大厅</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    body {
      background: #061e12;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      user-select: none;
    }
    /* Casino Felt Background */
    .felt-bg {
      background: radial-gradient(circle at center, #0f3d24 0%, #061e12 85%);
      position: relative;
    }
    .gold-border {
      border: 1px solid rgba(245, 158, 11, 0.35);
    }
    /* Top Bar */
    header {
      background: rgba(2, 6, 23, 0.85);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid rgba(245, 158, 11, 0.2);
      padding: 8px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
      color: #fbbf24;
      font-size: 15px;
    }
    .badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #34d399;
      font-family: monospace;
    }
    /* Poker Card */
    .card {
      width: 44px;
      height: 64px;
      background: #ffffff;
      border-radius: 6px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 3px 4px;
      cursor: pointer;
      position: relative;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      font-family: -apple-system, sans-serif;
      font-weight: bold;
      border: 1px solid #cbd5e1;
    }
    @media (min-width: 640px) {
      .card { width: 56px; height: 80px; padding: 5px; }
    }
    .card.red { color: #dc2626; }
    .card.black { color: #0f172a; }
    .card.selected {
      transform: translateY(-8px);
      box-shadow: 0 0 0 2px #fbbf24, 0 8px 16px rgba(0,0,0,0.5);
    }
    .card.dimmed { opacity: 0.35; pointer-events: none; }
    .card-top { font-size: 13px; line-height: 1; display: flex; align-items: center; gap: 1px; }
    .card-center { font-size: 18px; text-align: center; }
    .card-back {
      background: repeating-linear-gradient(45deg, #1e3a8a, #1e3a8a 5px, #172554 5px, #172554 10px);
      border: 2px solid #93c5fd;
    }
    /* Dun Slots */
    .dun-row {
      background: rgba(6, 30, 18, 0.7);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 8px;
      padding: 6px 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 6px;
    }
    .dun-title { font-size: 11px; font-weight: 700; color: #fbbf24; min-width: 70px; }
    .dun-eval { font-size: 11px; color: #a7f3d0; font-family: monospace; }
    .dun-slots { display: flex; gap: 4px; }
    .slot {
      width: 44px;
      height: 64px;
      border: 1px dashed rgba(245, 158, 11, 0.4);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.2);
    }
    @media (min-width: 640px) {
      .slot { width: 56px; height: 80px; }
    }
    /* Buttons */
    .btn {
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      transition: all 0.15s ease;
    }
    .btn-gold { background: #fbbf24; color: #020617; }
    .btn-gold:hover { background: #f59e0b; }
    .btn-dark { background: #1e293b; color: #cbd5e1; border: 1px solid #334155; }
    .btn-dark:hover { background: #334155; color: #ffffff; }
    .btn-danger { background: #dc2626; color: white; }
    /* Chat & Banner */
    .chat-drawer {
      position: fixed;
      bottom: 0;
      right: 0;
      width: 100%;
      max-width: 360px;
      background: rgba(15, 23, 42, 0.95);
      border-top: 1px solid rgba(245, 158, 11, 0.3);
      border-left: 1px solid rgba(245, 158, 11, 0.3);
      border-top-left-radius: 12px;
      z-index: 60;
      transform: translateY(calc(100% - 36px));
      transition: transform 0.25s ease;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.5);
    }
    .chat-drawer.open { transform: translateY(0); }
    .chat-header {
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      font-size: 12px;
      font-weight: 700;
      color: #fbbf24;
      background: rgba(30, 41, 59, 0.9);
      border-top-left-radius: 12px;
    }
    .chat-messages { height: 180px; overflow-y: auto; padding: 8px; font-size: 11px; display: flex; flex-direction: column; gap: 4px; }
    .chat-msg { background: rgba(30, 41, 59, 0.6); padding: 4px 8px; border-radius: 6px; }
    .chat-msg .name { color: #fbbf24; font-weight: bold; margin-right: 4px; }
    .quick-phrases { display: flex; flex-wrap: wrap; gap: 4px; padding: 6px; background: rgba(2, 6, 23, 0.6); }
    .phrase-tag { font-size: 10px; background: #334155; padding: 3px 6px; border-radius: 4px; cursor: pointer; color: #e2e8f0; }
    .phrase-tag:hover { background: #fbbf24; color: #020617; }
    /* Toast / Gunshot Popup */
    .gunshot-overlay {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 900;
      color: #ef4444;
      text-shadow: 0 0 20px rgba(239,68,68,0.8);
      opacity: 0;
      transform: scale(0.5);
      transition: all 0.25s ease;
    }
    .gunshot-overlay.show { opacity: 1; transform: scale(1.2); }
  </style>
</head>
<body class="felt-bg">
  <!-- Audio Context Synthesizer -->
  <header>
    <div class="brand">
      <span>🀄</span> 十三水在线对战
      <span class="badge" id="tunnel-status">Cloudflare 加密联机</span>
    </div>
    <div style="display:flex; align-items:center; gap:8px;">
      <span style="font-size:11px; color:#cbd5e1;" id="room-display">房间: room_888</span>
      <button class="btn btn-dark" style="padding:4px 8px; font-size:11px;" onclick="copyRoomLink()">📋 邀请好友</button>
    </div>
  </header>

  <!-- Main Game Stage -->
  <main style="flex:1; max-width: 800px; width: 100%; margin: 0 auto; padding: 10px; display: flex; flex-direction: column; gap: 8px;">
    
    <!-- Opponent Players Bar -->
    <div style="display:flex; justify-content:space-around; align-items:center; background:rgba(2,6,23,0.5); padding:8px; border-radius:12px;" id="opponents-bar">
      <!-- Player 2 -->
      <div style="text-align:center;">
        <div style="font-size:18px;">🤠</div>
        <div style="font-size:10px; font-weight:bold;" id="p2-name">牛仔老张</div>
        <div style="font-size:9px; color:#34d399;" id="p2-status">准备就绪</div>
      </div>
      <!-- Player 3 -->
      <div style="text-align:center;">
        <div style="font-size:18px;">🐱</div>
        <div style="font-size:10px; font-weight:bold;" id="p3-name">猫咪大师</div>
        <div style="font-size:9px; color:#34d399;" id="p3-status">已理牌</div>
      </div>
      <!-- Player 4 -->
      <div style="text-align:center;">
        <div style="font-size:18px;">🦊</div>
        <div style="font-size:10px; font-weight:bold;" id="p4-name">雀圣小王</div>
        <div style="font-size:9px; color:#fbbf24;" id="p4-status">理牌中...</div>
      </div>
    </div>

    <!-- Dao-Pai (相公) Warning Banner -->
    <div id="daopai-banner" style="display:none; background:rgba(220,38,38,0.25); border:1px solid rgba(220,38,38,0.6); color:#fca5a5; padding:6px 12px; border-radius:8px; font-size:11px; font-weight:bold; align-items:center; gap:6px;">
      ⚠️ <span id="daopai-text">倒牌违规警告：头道不能大于中道！请重新调整</span>
    </div>

    <!-- Special Hand (天胡) Banner -->
    <div id="special-banner" style="display:none; background:rgba(245,158,11,0.25); border:1px solid #fbbf24; color:#fef08a; padding:6px 12px; border-radius:8px; font-size:11px; font-weight:bold; align-items:center; justify-content:space-between;">
      <span>🌟 检测到特殊牌型天胡：<strong id="special-name">一条龙</strong> (+108水)</span>
      <button class="btn btn-gold" style="padding:3px 8px; font-size:10px;" onclick="claimSpecialWin()">天胡亮牌</button>
    </div>

    <!-- 3 Dun Arrangement Slots -->
    <div style="background:rgba(2,6,23,0.6); border:1px solid rgba(245,158,11,0.3); border-radius:12px; padding:10px;">
      
      <!-- Head Dun (3 cards) -->
      <div class="dun-row" onclick="selectDunTarget('head')">
        <div>
          <div class="dun-title">头道 (3张)</div>
          <div class="dun-eval" id="head-eval">-</div>
        </div>
        <div class="dun-slots" id="head-slots"></div>
      </div>

      <!-- Middle Dun (5 cards) -->
      <div class="dun-row" onclick="selectDunTarget('middle')">
        <div>
          <div class="dun-title">中道 (5张)</div>
          <div class="dun-eval" id="mid-eval">-</div>
        </div>
        <div class="dun-slots" id="mid-slots"></div>
      </div>

      <!-- Tail Dun (5 cards) -->
      <div class="dun-row" onclick="selectDunTarget('tail')">
        <div>
          <div class="dun-title">尾道 (5张)</div>
          <div class="dun-eval" id="tail-eval">-</div>
        </div>
        <div class="dun-slots" id="tail-slots"></div>
      </div>

    </div>

    <!-- Card Action Toolbar -->
    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
      <div style="display:flex; gap:6px;">
        <button class="btn btn-gold" onclick="autoSmartArrange()">⚡ 一键智能理牌</button>
        <button class="btn btn-dark" onclick="resetHandPool()">重置手牌</button>
      </div>
      <div style="display:flex; gap:6px;">
        <span style="font-size:11px; color:#fbbf24; align-self:center;" id="timer-text">倒计时 60s</span>
        <button class="btn btn-gold" id="submit-btn" onclick="submitHand()">确认出牌</button>
      </div>
    </div>

    <!-- 13 Cards Pool Tray -->
    <div style="background:rgba(2,6,23,0.7); border:1px solid rgba(245,158,11,0.25); border-radius:12px; padding:8px;">
      <div style="font-size:11px; color:#94a3b8; margin-bottom:4px; display:flex; justify-content:space-between;">
        <span>待分配手牌 (点击卡片放入目标道):</span>
        <span id="pool-count">13 / 13</span>
      </div>
      <div id="cards-pool" style="display:flex; flex-wrap:wrap; gap:4px; justify-content:center; min-height:70px;"></div>
    </div>

  </main>

  <!-- Real-time In-game Chat Drawer -->
  <div class="chat-drawer" id="chat-drawer">
    <div class="chat-header" onclick="toggleChat()">
      <span>💬 局内聊天与快捷弹幕</span>
      <span id="chat-toggle-icon">▲ 展开</span>
    </div>
    <div class="chat-messages" id="chat-messages">
      <div class="chat-msg"><span class="name">系统:</span> 欢迎来到十三水对战厅！支持 Cloudflare 隧道公网联机。</div>
    </div>
    <div class="quick-phrases">
      <span class="phrase-tag" onclick="sendQuickPhrase('快点出牌呀，等得花儿都谢了！⏱️')">快点出牌⏱️</span>
      <span class="phrase-tag" onclick="sendQuickPhrase('手牌逆天，看我这把通杀全场！🔥')">手牌逆天🔥</span>
      <span class="phrase-tag" onclick="sendQuickPhrase('谁敢跟我比尾道？🎴')">比尾道🎴</span>
      <span class="phrase-tag" onclick="sendQuickPhrase('吃我一记打枪！💥')">吃我打枪💥</span>
      <span class="phrase-tag" onclick="sendQuickPhrase('小心倒牌相公哦！😅')">小心倒牌😅</span>
      <span class="phrase-tag" onclick="sendQuickPhrase('承让承让！🏆')">承让承让🏆</span>
    </div>
    <div style="padding:6px; display:flex; gap:4px; background:#0f172a;">
      <input type="text" id="chat-input" placeholder="输入聊天内容..." style="flex:1; background:#1e293b; border:1px solid #334155; border-radius:6px; padding:4px 8px; color:white; font-size:11px;">
      <button class="btn btn-gold" style="padding:4px 8px; font-size:11px;" onclick="sendCustomChat()">发送</button>
    </div>
  </div>

  <!-- Gunshot & Grandslam Overlay FX -->
  <div class="gunshot-overlay" id="gunshot-overlay">💥 打枪！水数翻倍！</div>

  <script>
    // Audio Synthesizer
    let audioCtx = null;
    function playTone(freq, type, duration) {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch(e){}
    }

    function playDealSound() { playTone(600, 'triangle', 0.08); }
    function playClickSound() { playTone(880, 'sine', 0.05); }
    function playGunshotSound() { playTone(120, 'sawtooth', 0.4); }

    // Cards Data & Logic
    const SUITS = ['spades', 'hearts', 'clubs', 'diamonds'];
    const SUIT_SYMBOLS = { spades: '♠', hearts: '♥', clubs: '♣', diamonds: '♦' };
    const RANKS = [2,3,4,5,6,7,8,9,10,11,12,13,14];
    const RANK_LABELS = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };

    let myCards = [];
    let headCards = [];
    let midCards = [];
    let tailCards = [];
    let targetDun = 'head';

    // Parse URL room parameter
    const urlParams = new URLSearchParams(window.location.search);
    const currentRoom = urlParams.get('room') || 'room_888';
    document.getElementById('room-display').innerText = '房间: ' + currentRoom;

    // Generate random 13 cards for demo/real flow
    function generateFreshHand() {
      const deck = [];
      SUITS.forEach(s => {
        RANKS.forEach(r => {
          deck.push({ id: s + '_' + r, suit: s, rank: r, label: RANK_LABELS[r] || ('' + r) });
        });
      });
      deck.sort(() => Math.random() - 0.5);
      myCards = deck.slice(0, 13);
      headCards = [];
      midCards = [];
      tailCards = [];
      render();
    }

    function getCardInnerHtml(c) {
      const svgUrl = '/cards/' + c.suit + '_' + c.label + '.svg';
      return '<img src="' + svgUrl + '" onerror="this.style.display=\\'none\\'; this.nextElementSibling.style.display=\\'flex\\';" style="width:100%; height:100%; object-fit:contain; border-radius:4px; display:block;" />' +
        '<div style="display:none; width:100%; height:100%; flex-direction:column; justify-content:space-between;">' +
        '<div class="card-top"><span>' + c.label + '</span><span>' + SUIT_SYMBOLS[c.suit] + '</span></div>' +
        '<div class="card-center">' + SUIT_SYMBOLS[c.suit] + '</div>' +
        '</div>';
    }

    function render() {
      // Render Pool
      const poolEl = document.getElementById('cards-pool');
      poolEl.innerHTML = '';
      myCards.forEach((c, idx) => {
        const isSelected = headCards.includes(c) || midCards.includes(c) || tailCards.includes(c);
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card ' + (c.suit === 'hearts' || c.suit === 'diamonds' ? 'red' : 'black') + (isSelected ? ' dimmed' : '');
        cardDiv.innerHTML = getCardInnerHtml(c);
        cardDiv.onclick = () => { if (!isSelected) placeCard(c); };
        poolEl.appendChild(cardDiv);
      });
      document.getElementById('pool-count').innerText = (13 - (headCards.length + midCards.length + tailCards.length)) + ' / 13';

      // Render Head slots
      renderDunSlots('head-slots', headCards, 3, 'head');
      renderDunSlots('mid-slots', midCards, 5, 'middle');
      renderDunSlots('tail-slots', tailCards, 5, 'tail');

      // Update Evaluations
      updateDunEvaluations();
    }

    function renderDunSlots(containerId, cards, max, dunName) {
      const container = document.getElementById(containerId);
      container.innerHTML = '';
      for (let i = 0; i < max; i++) {
        if (cards[i]) {
          const c = cards[i];
          const cardDiv = document.createElement('div');
          cardDiv.className = 'card ' + (c.suit === 'hearts' || c.suit === 'diamonds' ? 'red' : 'black');
          cardDiv.innerHTML = getCardInnerHtml(c);
          cardDiv.onclick = (e) => { e.stopPropagation(); removeCardFromDun(dunName, c); };
          container.appendChild(cardDiv);
        } else {
          const slotDiv = document.createElement('div');
          slotDiv.className = 'slot';
          slotDiv.innerText = '+';
          slotDiv.onclick = () => { targetDun = dunName; };
          container.appendChild(slotDiv);
        }
      }
    }

    function placeCard(card) {
      playClickSound();
      if (headCards.length < 3) headCards.push(card);
      else if (midCards.length < 5) midCards.push(card);
      else if (tailCards.length < 5) tailCards.push(card);
      render();
    }

    function removeCardFromDun(dunName, card) {
      playClickSound();
      if (dunName === 'head') headCards = headCards.filter(c => c !== card);
      if (dunName === 'middle') midCards = midCards.filter(c => c !== card);
      if (dunName === 'tail') tailCards = tailCards.filter(c => c !== card);
      render();
    }

    function resetHandPool() {
      headCards = []; midCards = []; tailCards = [];
      render();
    }

    function selectDunTarget(dun) {
      targetDun = dun;
    }

    // Auto Smart Arrange Algorithm
    function autoSmartArrange() {
      playDealSound();
      const sorted = [...myCards].sort((a,b) => b.rank - a.rank);
      // Simple smart distribution: top heavy for tail, middle, then head
      tailCards = sorted.slice(0, 5);
      midCards = sorted.slice(5, 10);
      headCards = sorted.slice(10, 13);
      render();
    }

    function updateDunEvaluations() {
      const daopaiBanner = document.getElementById('daopai-banner');
      const submitBtn = document.getElementById('submit-btn');

      if (headCards.length === 3 && midCards.length === 5 && tailCards.length === 5) {
        // Simple check ranks sum as heuristic demo
        const headSum = headCards.reduce((acc,c) => acc + c.rank, 0);
        const midSum = midCards.reduce((acc,c) => acc + c.rank, 0);
        const tailSum = tailCards.reduce((acc,c) => acc + c.rank, 0);

        if (headSum > midSum) {
          daopaiBanner.style.display = 'flex';
          document.getElementById('daopai-text').innerText = '倒牌警告：头道实力大于中道！请调换牌张';
          submitBtn.disabled = true;
          submitBtn.style.opacity = '0.5';
          return;
        }
        if (midSum > tailSum) {
          daopaiBanner.style.display = 'flex';
          document.getElementById('daopai-text').innerText = '倒牌警告：中道实力大于尾道！请调换牌张';
          submitBtn.disabled = true;
          submitBtn.style.opacity = '0.5';
          return;
        }
      }
      daopaiBanner.style.display = 'none';
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }

    function submitHand() {
      if (headCards.length !== 3 || midCards.length !== 5 || tailCards.length !== 5) {
        alert('请将13张手牌全部摆放完毕再确认出牌！');
        return;
      }
      playClickSound();
      showGunshotAnim();
      alert('✓ 出牌成功！正在等待其他玩家完成理牌比牌...');
    }

    function showGunshotAnim() {
      playGunshotSound();
      const fx = document.getElementById('gunshot-overlay');
      fx.classList.add('show');
      setTimeout(() => fx.classList.remove('show'), 1200);
    }

    function copyRoomLink() {
      const url = window.location.origin + window.location.pathname + '?room=' + currentRoom;
      navigator.clipboard.writeText(url).then(() => {
        alert('已复制房间邀请链接：' + url + '，发给好友打开即可同桌开打！');
      });
    }

    // Chat Drawer
    let chatOpen = false;
    function toggleChat() {
      chatOpen = !chatOpen;
      const drawer = document.getElementById('chat-drawer');
      const icon = document.getElementById('chat-toggle-icon');
      if (chatOpen) {
        drawer.classList.add('open');
        icon.innerText = '▼ 收起';
      } else {
        drawer.classList.remove('open');
        icon.innerText = '▲ 展开';
      }
    }

    function sendQuickPhrase(text) {
      appendChatMessage('我', text);
      playClickSound();
    }

    function sendCustomChat() {
      const input = document.getElementById('chat-input');
      if (input.value.trim()) {
        appendChatMessage('我', input.value.trim());
        input.value = '';
        playClickSound();
      }
    }

    function appendChatMessage(sender, text) {
      const box = document.getElementById('chat-messages');
      const div = document.createElement('div');
      div.className = 'chat-msg';
      div.innerHTML = '<span class="name">' + sender + ':</span> ' + text;
      box.appendChild(div);
      box.scrollTop = box.scrollHeight;
    }

    // WebSocket Auto-Connect (Cloudflare Compatible)
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = protocol + '//' + window.location.host + '/ws';
      const ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        document.getElementById('tunnel-status').innerText = 'CF 实时联机已握手';
        ws.send(JSON.stringify({ type: 'join', room: currentRoom, name: '玩家_' + Math.floor(Math.random()*9000+1000) }));
      };
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'chat') appendChatMessage(msg.sender, msg.text);
      };
    } catch(e){}

    // Init
    generateFreshHand();
  </script>
</body>
</html>`;
