import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, '../public/audio/phrases');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

const list = [
  {
    id: 's1',
    voice: 'Kore',
    prompt: '以极度娇滴滴、软萌撒娇的小萝莉少女甜美声音求饶说：哥哥手下留情嘛，人家不想输水水～'
  },
  {
    id: 'f1',
    voice: 'Kore',
    prompt: '以成熟干练冷艳的御姐女声冷笑自信说道：姐姐劝你早点认输，少输几道水！'
  },
  {
    id: 'e4',
    voice: 'Fenrir',
    prompt: '以慈祥和蔼的老爷爷慢吞吞的声音说：出牌慢一点，老人家眼睛有点花咯～'
  },
  {
    id: 'r2',
    voice: 'Fenrir',
    prompt: '以气急败坏的粗暴汉子咆哮怒吼道：气死我了！连续三把乌龙，老子要逆天！'
  },
  {
    id: 'qr1',
    voice: 'Puck',
    prompt: '以搞笑求饶的年轻小伙菜鸟声音喊道：手下留情，别打我枪啊大佬！'
  },
  {
    id: 'cui1',
    voice: 'Puck',
    prompt: '以焦急风趣的年轻小伙男声催促说：快点出牌啊，我等得花儿都谢了！'
  },
  {
    id: 'm2',
    voice: 'Puck',
    prompt: '以幽默风趣的自信大哥男声笑说道：这把牌太神，我都不好意思赢你们！'
  },
  {
    id: 'g1',
    voice: 'Puck',
    prompt: '以滑稽自嘲的小丑男声搞笑说：以为我要起飞，结果我是小丑！'
  }
];

async function main() {
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const target = path.join(outDir, `${item.id}.wav`);
    if (fs.existsSync(target) && fs.statSync(target).size > 1000) {
      console.log(`[SKIP] ${item.id}.wav already exists`);
      continue;
    }

    console.log(`[GEN ${i + 1}/${list.length}] ${item.id} with ${item.voice}...`);
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [{ role: 'user', parts: [{ text: item.prompt }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: item.voice } }
          }
        }
      });

      const b64 = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (b64) {
        fs.writeFileSync(target, Buffer.from(b64, 'base64'));
        console.log(`  -> Saved ${item.id}.wav (${b64.length} bytes)`);
      } else {
        console.warn(`  -> No audio for ${item.id}`);
      }
    } catch (e) {
      console.error(`  -> Failed ${item.id}:`, e.message);
    }

    // Delay 3 seconds between requests
    await new Promise((r) => setTimeout(r, 3000));
  }
  console.log('Done generating all requested voice pack files!');
}

main().catch(console.error);
