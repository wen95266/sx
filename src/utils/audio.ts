// Web Audio API Synthesizer & Mandarin Chinese TTS Voice for Thirteen Cards game

export type VoicePersona = 'male' | 'female' | 'elder' | 'child' | 'cute' | 'roar' | 'meme';

export interface VoicePhrase {
  id: string;
  category: VoicePersona;
  categoryName: string;
  scenario?: 'cui' | 'tiaoxin' | 'qiurao' | 'wenhou' | 'gaoxiao';
  avatar: string;
  roleTitle: string;
  text: string;
  pitch: number;
  rate: number;
}

export const HUMOROUS_VOICE_PHRASES: VoicePhrase[] = [
  // 1. 催牌急救 (Rush)
  {
    id: 'c1',
    category: 'child',
    categoryName: '小孩',
    scenario: 'cui',
    avatar: '👶',
    roleTitle: '淘气萌娃',
    text: '叔叔阿姨快点出牌呀，我等得花儿都谢啦！',
    pitch: 1.7,
    rate: 1.22
  },
  {
    id: 'cui1',
    category: 'male',
    categoryName: '男声',
    scenario: 'cui',
    avatar: '⚡',
    roleTitle: '催牌达人',
    text: '快点出牌啊，我等得花儿都谢了！',
    pitch: 1.0,
    rate: 1.25
  },
  {
    id: 'f3',
    category: 'female',
    categoryName: '女声',
    scenario: 'cui',
    avatar: '💅',
    roleTitle: '傲娇千金',
    text: '别思考太久，本姑娘的时间可是很宝贵的～',
    pitch: 1.28,
    rate: 1.1
  },
  {
    id: 'r1',
    category: 'roar',
    categoryName: '怒吼',
    scenario: 'cui',
    avatar: '💥',
    roleTitle: '咆哮帝',
    text: '别磨叽了！快点出牌！老子等不及了！',
    pitch: 0.5,
    rate: 1.35
  },
  {
    id: 'e4',
    category: 'elder',
    categoryName: '老人',
    scenario: 'cui',
    avatar: '🀄',
    roleTitle: '老门东牌圣',
    text: '出牌慢一点，老人家眼睛有点花咯～',
    pitch: 0.7,
    rate: 0.85
  },

  // 2. 挑衅炫耀 (Brag & Provoke)
  {
    id: 'm1',
    category: 'male',
    categoryName: '男声',
    scenario: 'tiaoxin',
    avatar: '👨',
    roleTitle: '霸气神豪',
    text: '准备好水数，这把我要通杀全场！',
    pitch: 0.85,
    rate: 1.05
  },
  {
    id: 'm2',
    category: 'male',
    categoryName: '男声',
    scenario: 'tiaoxin',
    avatar: '😎',
    roleTitle: '搞笑大哥',
    text: '这把牌太神，我都不好意思赢你们！',
    pitch: 0.88,
    rate: 1.08
  },
  {
    id: 'm3',
    category: 'male',
    categoryName: '男声',
    scenario: 'tiaoxin',
    avatar: '💰',
    roleTitle: '金主爸爸',
    text: '牌好任性！全场消费由本少爷买单！',
    pitch: 0.82,
    rate: 1.02
  },
  {
    id: 'm4',
    category: 'male',
    categoryName: '男声',
    scenario: 'tiaoxin',
    avatar: '🦁',
    roleTitle: '霸气雀王',
    text: '谁与争锋？在我面前全都是弟弟！',
    pitch: 0.8,
    rate: 1.1
  },
  {
    id: 'f1',
    category: 'female',
    categoryName: '女声',
    scenario: 'tiaoxin',
    avatar: '💋',
    roleTitle: '御姐女皇',
    text: '姐姐劝你早点认输，少输几道水！',
    pitch: 1.22,
    rate: 1.08
  },
  {
    id: 'f2',
    category: 'female',
    categoryName: '女声',
    scenario: 'tiaoxin',
    avatar: '👠',
    roleTitle: '知性女神',
    text: '牌型这么好看，不赢我都对不起自己！',
    pitch: 1.25,
    rate: 1.05
  },
  {
    id: 'c2',
    category: 'child',
    categoryName: '小孩',
    scenario: 'tiaoxin',
    avatar: '🍭',
    roleTitle: '吃货萌娃',
    text: '哇！我拿到超级厉害的无敌神牌啦！',
    pitch: 1.75,
    rate: 1.25
  },
  {
    id: 'r4',
    category: 'roar',
    categoryName: '怒吼',
    scenario: 'tiaoxin',
    avatar: '⚡',
    roleTitle: '雷霆吼兽',
    text: '颤抖吧！这把老子要血洗全场！',
    pitch: 0.46,
    rate: 1.4
  },

  // 3. 认输求饶 (Beg & Surrender)
  {
    id: 's1',
    category: 'cute',
    categoryName: '撒娇',
    scenario: 'qiurao',
    avatar: '🥺',
    roleTitle: '撒娇妹妹',
    text: '哥哥手下留情嘛，人家不想输水水～',
    pitch: 1.88,
    rate: 0.92
  },
  {
    id: 's2',
    category: 'cute',
    categoryName: '撒娇',
    scenario: 'qiurao',
    avatar: '🌸',
    roleTitle: '呆萌甜妹',
    text: '嘤嘤嘤，人家刚刚手滑放错墩了啦！',
    pitch: 1.92,
    rate: 0.96
  },
  {
    id: 's3',
    category: 'cute',
    categoryName: '撒娇',
    scenario: 'qiurao',
    avatar: '🎀',
    roleTitle: '娇滴水萌宝',
    text: '给个机会嘛，人家下把一定乖乖的～',
    pitch: 1.85,
    rate: 0.9
  },
  {
    id: 's4',
    category: 'cute',
    categoryName: '撒娇',
    scenario: 'qiurao',
    avatar: '💕',
    roleTitle: '粘人小甜心',
    text: '人家牌这么弱，哥哥不准打人家枪枪哦～',
    pitch: 1.9,
    rate: 0.94
  },
  {
    id: 'qr1',
    category: 'female',
    categoryName: '女声',
    scenario: 'qiurao',
    avatar: '😭',
    roleTitle: '战败萌新',
    text: '手下留情，别打我枪啊大佬！',
    pitch: 1.3,
    rate: 1.1
  },
  {
    id: 'r2',
    category: 'roar',
    categoryName: '怒吼',
    scenario: 'qiurao',
    avatar: '🔥',
    roleTitle: '暴躁老哥',
    text: '气死我了！连续三把乌龙，老子要逆天！',
    pitch: 0.52,
    rate: 1.38
  },

  // 4. 礼貌问候 (Greetings & Respect)
  {
    id: 'c3',
    category: 'child',
    categoryName: '小孩',
    scenario: 'wenhou',
    avatar: '🐣',
    roleTitle: '可萌萝莉',
    text: '叔叔阿姨好！我还是个孩子，你们可不能打我枪哦！',
    pitch: 1.8,
    rate: 1.2
  },
  {
    id: 'wh1',
    category: 'male',
    categoryName: '男声',
    scenario: 'wenhou',
    avatar: '🙇',
    roleTitle: '谦虚新手',
    text: '各位大佬好，小弟初来乍到，请多关照！',
    pitch: 1.0,
    rate: 1.0
  },
  {
    id: 'e1',
    category: 'elder',
    categoryName: '老人',
    scenario: 'wenhou',
    avatar: '👴',
    roleTitle: '扫地老僧',
    text: '老夫玩十三水的时候，你们还在抓泥巴呢！',
    pitch: 0.65,
    rate: 0.82
  },
  {
    id: 'f4',
    category: 'female',
    categoryName: '女声',
    scenario: 'wenhou',
    avatar: '🍷',
    roleTitle: '优雅贵妇',
    text: '优雅，永不过时，祝大家牌运昌隆！',
    pitch: 1.18,
    rate: 0.98
  },

  // 5. 爆笑梗包 (Fun & Memes)
  {
    id: 'g1',
    category: 'meme',
    categoryName: '搞笑梗',
    scenario: 'gaoxiao',
    avatar: '🤡',
    roleTitle: '绝活哥',
    text: '以为我要起飞，结果我是小丑！',
    pitch: 1.12,
    rate: 1.12
  },
  {
    id: 'g2',
    category: 'meme',
    categoryName: '搞笑梗',
    scenario: 'gaoxiao',
    avatar: '🛸',
    roleTitle: '梗王',
    text: '泰裤辣！这牌型简直是绝绝子！',
    pitch: 1.15,
    rate: 1.15
  },
  {
    id: 'c4',
    category: 'child',
    categoryName: '小孩',
    scenario: 'gaoxiao',
    avatar: '🎈',
    roleTitle: '无敌小霸王',
    text: '耶！赢了赢了，我要拿水数买超级大糖果！',
    pitch: 1.68,
    rate: 1.28
  },
  {
    id: 'e2',
    category: 'elder',
    categoryName: '老人',
    scenario: 'gaoxiao',
    avatar: '🍵',
    roleTitle: '太极宗师',
    text: '年轻人不要太气盛，老夫要开始发功了！',
    pitch: 0.68,
    rate: 0.8
  },
  {
    id: 'e3',
    category: 'elder',
    categoryName: '老人',
    scenario: 'gaoxiao',
    avatar: '📜',
    roleTitle: '玄学老仙',
    text: '稳住！老夫这套牌蕴含天地阴阳五行！',
    pitch: 0.62,
    rate: 0.78
  },
  {
    id: 'r3',
    category: 'roar',
    categoryName: '怒吼',
    scenario: 'gaoxiao',
    avatar: '💣',
    roleTitle: '狂暴战神',
    text: '谁敢打我枪？老子直接同花顺通杀你！',
    pitch: 0.48,
    rate: 1.32
  }
];

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

let cachedVoices: SpeechSynthesisVoice[] = [];
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const updateVoices = () => {
    try {
      cachedVoices = window.speechSynthesis.getVoices() || [];
    } catch (e) {
      console.warn('[Audio] Error loading voices:', e);
    }
  };
  updateVoices();
  window.speechSynthesis.onvoiceschanged = updateVoices;
}

export const SoundEffects = {
  // 0. 角色专属 Web Audio 辅助音效 (确保任何手机或浏览器均有极高可辨识度角色声质)
  playPersonaAudioCue(persona: VoicePersona) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (persona === 'male' || persona === 'roar') {
        // 男低音 / 咆哮：低沉 Sawtooth 锯齿波 (90Hz -> 65Hz)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(95, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(65, ctx.currentTime + 0.28);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(220, ctx.currentTime);

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
      } else if (persona === 'elder') {
        // 老人：沧桑低频 (105Hz Triangle)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(105, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(75, ctx.currentTime + 0.35);

        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
      } else if (persona === 'child') {
        // 小孩：清脆高音风铃 (880Hz -> 1320Hz Sine)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
      } else if (persona === 'cute') {
        // 撒娇妹子：高亢甜美声 (1046Hz -> 1568Hz Sine)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1568, ctx.currentTime + 0.22);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);
      } else {
        // 标准清爽女声
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);
      }

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn('[Audio] Persona cue error:', e);
    }
  },

  // 1. 角色特征普通话 TTS 语音播放 (男声 / 女声 / 老人 / 小孩 / 撒娇 / 怒吼)
  speakMandarinWithRole(text: string, pitch = 1.0, rate = 1.0, persona: VoicePersona = 'male') {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      // 播放角色特征提示音
      this.playPersonaAudioCue(persona);

      let cleanText = text
        .replace(
          /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}\u{2388}\u{2B05}\u{2B06}\u{2B07}\u{2B1B}\u{2B1C}\u{2B50}\u{2B55}\u{2934}\u{2935}\u{2194}-\u{2199}\u{21A9}-\u{21AA}\u{3299}\u{3297}\u{303D}\u{00A9}\u{00AE}\u{2122}]/gu,
          ''
        )
        .replace(/[【】]/g, '')
        .trim();

      if (!cleanText) cleanText = '收到新消息！';

      window.speechSynthesis.cancel(); // 停止前一句

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'zh-CN';

      // Enforce extreme acoustic pitch modulation per persona to guarantee distinction even on 1-voice devices
      let finalPitch = pitch;
      let finalRate = rate;

      if (persona === 'child') {
        finalPitch = 1.95; // 极高童声
        finalRate = 1.28;
      } else if (persona === 'cute') {
        finalPitch = 1.85; // 高声撒娇
        finalRate = 0.92;
      } else if (persona === 'male') {
        finalPitch = 0.18; // 极低男低音 (音调下降两八度，强制压低音色)
        finalRate = 1.05;
      } else if (persona === 'elder') {
        finalPitch = 0.12; // 极低沧桑老者音
        finalRate = 0.78;
      } else if (persona === 'roar') {
        finalPitch = 0.1; // 极低咆哮重音
        finalRate = 1.35;
      } else if (persona === 'female') {
        finalPitch = 1.25; // 清爽女声
        finalRate = 1.08;
      } else if (persona === 'meme') {
        finalPitch = 1.15;
        finalRate = 1.15;
      }

      utterance.rate = finalRate;
      utterance.pitch = finalPitch;
      utterance.volume = persona === 'roar' ? 1.0 : 0.95;

      const liveVoices = window.speechSynthesis.getVoices();
      const voices = liveVoices.length > 0 ? liveVoices : cachedVoices;

      let matchedVoice: SpeechSynthesisVoice | undefined;

      if (persona === 'female' || persona === 'cute') {
        matchedVoice = voices.find((v) => {
          const name = v.name.toLowerCase();
          const lang = v.lang.toLowerCase();
          return (
            (lang.includes('zh') || lang.includes('cmn')) &&
            (name.includes('xiaoxiao') ||
              name.includes('female') ||
              name.includes('huihui') ||
              name.includes('yaoyao') ||
              name.includes('tingting') ||
              name.includes('sfg') ||
              name.includes('女') ||
              name.includes('woman'))
          );
        });
      } else if (persona === 'male' || persona === 'roar' || persona === 'elder') {
        matchedVoice = voices.find((v) => {
          const name = v.name.toLowerCase();
          const lang = v.lang.toLowerCase();
          return (
            (lang.includes('zh') || lang.includes('cmn')) &&
            (name.includes('yunxi') ||
              name.includes('yunjian') ||
              name.includes('kangkang') ||
              name.includes('male') ||
              name.includes('c2f') ||
              name.includes('a1') ||
              name.includes('b1') ||
              name.includes('d1') ||
              name.includes('cmn') ||
              name.includes('男') ||
              name.includes('man') ||
              name.includes('boy'))
          );
        });
      }

      if (!matchedVoice) {
        matchedVoice = voices.find(
          (v) => v.lang.includes('zh') || v.lang.includes('cmn') || v.name.includes('Chinese')
        );
      }

      if (!matchedVoice && voices.length > 0) {
        matchedVoice = voices[0];
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('[Audio] Persona TTS error:', e);
    }
  },

  // 普通话真人语音播放 (Web Speech API Mandarin TTS)
  speakMandarin(text: string) {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      // 过滤表情符号与特殊标记，提取干净普通话文字
      let cleanText = text
        .replace(
          /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}\u{2388}\u{2B05}\u{2B06}\u{2B07}\u{2B1B}\u{2B1C}\u{2B50}\u{2B55}\u{2934}\u{2935}\u{2194}-\u{2199}\u{21A9}-\u{21AA}\u{3299}\u{3297}\u{303D}\u{00A9}\u{00AE}\u{2122}]/gu,
          ''
        )
        .replace(/[【】]/g, '')
        .trim();

      // 如果是语音消息标记，转换为自然普通话语音
      if (cleanText.includes('语音消息') || cleanText.includes('语音')) {
        cleanText = cleanText.replace(/0:\d{2}/g, '').trim() || '收到一条语音消息！';
      }

      if (!cleanText) cleanText = '收到新消息！';

      window.speechSynthesis.cancel(); // 停止上一句

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'zh-CN';
      utterance.rate = 1.08; // 竞技感生动语速
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const zhVoice = voices.find(
        (v) =>
          v.lang.includes('zh') ||
          v.lang.includes('cmn') ||
          v.name.includes('Chinese') ||
          v.name.includes('Mandarin') ||
          v.name.includes('普通话') ||
          v.name.includes('Xiaoxiao') ||
          v.name.includes('Yunxi')
      );
      if (zhVoice) {
        utterance.voice = zhVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('[Audio] Mandarin TTS error:', e);
    }
  },

  // 语音对讲机哔声 (Walkie-talkie chirp)
  playVoiceChirp() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1320, now + 0.05);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  },

  // 播放语音消息气泡 (支持实际录音 Blob 与 TTS 普通话双通道)
  playVoiceMessage(audioUrl?: string, textContent?: string) {
    this.playVoiceChirp();
    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        audio.play().catch(() => {
          this.speakMandarin(textContent || '收到语音消息');
        });
        return;
      } catch {}
    }
    this.speakMandarin(textContent || '收到一条语音消息！');
  },

  // 2. Card click / select
  playCardClick() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Ignore
    }
  },

  // 3. Deal card swipe sound
  playDealCard() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.Q.setValueAtTime(2.0, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
    } catch {
      // Ignore
    }
  },

  // 4. Showdown compare Ding
  playShowdownDing(isHigh = false) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const baseFreq = isHigh ? 880 : 523.25;
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Ignore
    }
  },

  // 5. Gun Shot (打枪翻倍音效)
  playGunShot() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const bufferSize = ctx.sampleRate * 0.35;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.3);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
      oscGain.gain.setValueAtTime(0.3, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      noise.start();
      osc.start();
      osc.stop(now + 0.25);
    } catch {
      // Ignore
    }
  },

  // 6. Grand Slam / Victory Fanfare (全垒打 / 获胜号角)
  playFanfare() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.2, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.4);
      });
    } catch {
      // Ignore
    }
  },

  // 7. Dao-Pai Error Warning (倒牌警报)
  playWarning() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(180, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Ignore
    }
  },

  // 8. Message pop
  playMessagePop() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Ignore
    }
  },

  // 9. Emoji pop
  playEmojiReaction() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Ignore
    }
  }
};
