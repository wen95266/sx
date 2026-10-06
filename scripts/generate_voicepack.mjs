import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, '../public/audio/phrases');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

const phrases = [
  // 小孩 (Child)
  {
    id: 'c1',
    voice: 'Zephyr',
    prompt: '以活泼淘气的5岁小孩萌娃声音说：叔叔阿姨快点出牌呀，我等得花儿都谢啦！'
  },
  {
    id: 'c3',
    voice: 'Zephyr',
    prompt: '以幼儿园可爱小萌娃的声音天真地说：叔叔阿姨好！我还是个孩子，你们可不能打我枪哦！'
  },
  {
    id: 'c2',
    voice: 'Zephyr',
    prompt: '以兴奋的小朋友开心欢呼的声音说：哇！我拿到超级厉害的无敌神牌啦！'
  },
  {
    id: 'c4',
    voice: 'Zephyr',
    prompt: '以欢天喜地的小朋友稚嫩声音说：耶！赢了赢了，我要拿水数买超级大糖果！'
  },

  // 霸气/搞笑男声 (Male)
  {
    id: 'm1',
    voice: 'Charon',
    prompt: '以成熟霸气浑厚的大哥男声自信地说：准备好水数，这把我要通杀全场！'
  },
  {
    id: 'm2',
    voice: 'Puck',
    prompt: '以幽默搞笑的大哥自信男声说：这把牌太神，我都不好意思赢你们！'
  },
  {
    id: 'm3',
    voice: 'Puck',
    prompt: '以年轻豪爽的富少爷男声霸气说：牌好任性！全场消费由本少爷买单！'
  },
  {
    id: 'm4',
    voice: 'Charon',
    prompt: '以极其浑厚沉稳的雀王男声威严说：谁与争锋？在我面前全都是弟弟！'
  },
  {
    id: 'cui1',
    voice: 'Puck',
    prompt: '以焦急风趣的年轻小伙男声催促说：快点出牌啊，我等得花儿都谢了！'
  },
  {
    id: 'wh1',
    voice: 'Puck',
    prompt: '以年轻礼貌的小伙男声说：各位大佬好，小弟初来乍到，请多关照！'
  },

  // 粗犷怒吼咆哮 (Roar)
  {
    id: 'r1',
    voice: 'Fenrir',
    prompt: '以粗暴凶悍的大汉暴躁咆哮怒吼道：别磨叽了！快点出牌！老子等不及了！'
  },
  {
    id: 'r2',
    voice: 'Fenrir',
    prompt: '以气急败坏的大汉咆哮怒吼道：气死我了！连续三把乌龙，老子要逆天！'
  },
  {
    id: 'r3',
    voice: 'Fenrir',
    prompt: '以威猛雄浑的暴躁男声大喊道：谁敢打我枪？老子直接同花顺通杀你！'
  },
  {
    id: 'r4',
    voice: 'Fenrir',
    prompt: '以低沉凶猛的霸气男声冷酷说道：颤抖吧！这把老子要血洗全场！'
  },

  // 沧桑老人 (Elder)
  {
    id: 'e1',
    voice: 'Fenrir',
    prompt: '以八十岁老道士隐士白发老翁沧桑缓慢的声音慢悠悠地说：老夫玩十三水的时候，你们还在抓泥巴呢！'
  },
  {
    id: 'e2',
    voice: 'Fenrir',
    prompt: '以白发太极老宗师苍老深沉的声音威严地说：年轻人不要太气盛，老夫要开始发功了！'
  },
  {
    id: 'e3',
    voice: 'Fenrir',
    prompt: '以仙风道骨的白胡子老神仙苍老沙哑声音说：稳住！老夫这套牌蕴含天地阴阳五行！'
  },
  {
    id: 'e4',
    voice: 'Fenrir',
    prompt: '以和蔼可亲、眼花耳背的白发老爷爷声音慢吞吞地说：出牌慢一点，老人家眼睛有点花咯～'
  },

  // 撒娇卖萌 (Cute)
  {
    id: 's1',
    voice: 'Kore',
    prompt: '以极其娇滴滴、软萌撒娇的小萝莉少女声音求饶说：哥哥手下留情嘛，人家不想输水水～'
  },
  {
    id: 's2',
    voice: 'Kore',
    prompt: '以委屈撒娇、软糯可爱的呆萌妹子声音说：嘤嘤嘤，人家刚刚手滑放错墩了啦！'
  },
  {
    id: 's3',
    voice: 'Kore',
    prompt: '以娇羞甜美的年轻软妹子声音说：给个机会嘛，人家下把一定乖乖的～'
  },
  {
    id: 's4',
    voice: 'Kore',
    prompt: '以粘人撒娇的甜妹子声音轻声说：人家牌这么弱，哥哥不准打人家枪枪哦～'
  },

  // 成熟女声 (Female)
  {
    id: 'f1',
    voice: 'Kore',
    prompt: '以成熟干练冷艳的御姐女声冷笑自信说道：姐姐劝你早点认输，少输几道水！'
  },
  {
    id: 'f2',
    voice: 'Kore',
    prompt: '以知性优雅、落落大方的成熟女声轻笑说道：牌型这么好看，不赢我都对不起自己！'
  },
  {
    id: 'f3',
    voice: 'Kore',
    prompt: '以傲娇千金大小姐的声音不耐烦说道：别思考太久，本姑娘的时间可是很宝贵的～'
  },
  {
    id: 'f4',
    voice: 'Kore',
    prompt: '以高贵优雅的成熟贵妇声音端庄说道：优雅，永不过时，祝大家牌运昌隆！'
  },

  // 搞笑梗包 (Meme)
  {
    id: 'qr1',
    voice: 'Puck',
    prompt: '以搞笑惨叫求饶的年轻菜鸟男声大喊道：手下留情，别打我枪啊大佬！'
  },
  {
    id: 'g1',
    voice: 'Puck',
    prompt: '以滑稽自嘲的小丑男声搞笑说：以为我要起飞，结果我是小丑！'
  },
  {
    id: 'g2',
    voice: 'Puck',
    prompt: '以极其夸张搞笑的网络男主播声大喊：泰裤辣！这牌型简直是绝绝子！'
  }
];

async function generateOne(p) {
  const targetFile = path.join(outDir, `${p.id}.wav`);
  if (fs.existsSync(targetFile) && fs.statSync(targetFile).size > 1000) {
    console.log(`[SKIP] Already exists: ${p.id}.wav`);
    return;
  }

  console.log(`[GEN] Generating ${p.id} (${p.voice})...`);
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [{
        role: 'user',
        parts: [{ text: p.prompt }]
      }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: p.voice }
          }
        }
      }
    });

    const b64 = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (b64) {
      fs.writeFileSync(targetFile, Buffer.from(b64, 'base64'));
      console.log(`  -> Saved ${p.id}.wav (${b64.length} bytes)`);
    } else {
      console.warn(`  -> No audio returned for ${p.id}`);
    }
  } catch (err) {
    console.error(`  -> Error generating ${p.id}:`, err.message);
  }
}

async function main() {
  console.log(`Starting voice pack generation for ${phrases.length} phrases with concurrency 4...`);
  const queue = [...phrases];
  const workers = Array(4).fill(null).map(async () => {
    while (queue.length > 0) {
      const p = queue.shift();
      if (p) await generateOne(p);
    }
  });

  await Promise.all(workers);
  console.log('Voice pack generation complete!');
}

main().catch(console.error);
