import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
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

const list = [
  // 1. 小孩 (Child Voice - Zephyr)
  { id: 'c1', voice: 'Zephyr', text: '叔叔阿姨快点出牌呀，我等得花儿都谢啦！' },
  { id: 'c3', voice: 'Zephyr', text: '叔叔阿姨好！我还是个孩子，你们可不能打我枪哦！' },
  { id: 'c2', voice: 'Zephyr', text: '哇！我拿到超级厉害的无敌神牌啦！' },
  { id: 'c4', voice: 'Zephyr', text: '耶！赢了赢了，我要拿水数买超级大糖果！' },

  // 2. 霸气/搞笑男声 (Male Voice - Charon / Puck)
  { id: 'm1', voice: 'Charon', text: '准备好水数，这把我要通杀全场！' },
  { id: 'm2', voice: 'Puck', text: '这把牌太神，我都不好意思赢你们！' },
  { id: 'm3', voice: 'Puck', text: '牌好任性！全场消费由本少爷买单！' },
  { id: 'cui1', voice: 'Puck', text: '快点出牌啊，我等得花儿都谢了！' },

  // 3. 粗犷怒吼 (Roar Male Voice - Fenrir)
  { id: 'r1', voice: 'Fenrir', text: '别磨叽了！快点出牌！老子等不及了！' },
  { id: 'r2', voice: 'Fenrir', text: '气死我了！连续三把乌龙，老子要逆天！' },

  // 4. 沧桑老人 (Elder Master Voice - Fenrir)
  { id: 'e1', voice: 'Fenrir', text: '老夫玩十三水的时候，你们还在抓泥巴呢！' },
  { id: 'e4', voice: 'Fenrir', text: '出牌慢一点，老人家眼睛有点花咯～' },

  // 5. 撒娇卖萌 (Sweet Girl Voice - Kore)
  { id: 's1', voice: 'Kore', text: '哥哥手下留情嘛，人家不想输水水～' },

  // 6. 干练御姐 (Confident Female Voice - Kore)
  { id: 'f1', voice: 'Kore', text: '姐姐劝你早点认输，少输几道水！' },

  // 7. 搞笑梗包 (Comedy Guy Voice - Puck)
  { id: 'qr1', voice: 'Puck', text: '手下留情，别打我枪啊大佬！' },
  { id: 'g1', voice: 'Puck', text: '以为我要起飞，结果我是小丑！' }
];

async function main() {
  console.log(`Starting pure-text voice regeneration for ${list.length} phrases...`);

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const wavPath = path.join(outDir, `${item.id}.wav`);
    const mp3Path = path.join(outDir, `${item.id}.mp3`);

    console.log(`[${i + 1}/${list.length}] Generating ${item.id} (${item.voice}): "${item.text}"`);

    const modelsToTry = [
      'gemini-3.8-flash-lite-tts',
      'gemini-3.1-flash-tts-preview',
      'gemini-2.5-flash-preview-tts'
    ];

    let success = false;
    for (const model of modelsToTry) {
      try {
        const res = await ai.models.generateContent({
          model,
          contents: [{
            role: 'user',
            parts: [{ text: item.text }]
          }],
          config: {
            systemInstruction: 'You are an expressive game character voice actor. Read the text aloud word-for-word in Chinese with genuine emotion. Do not speak any explanation or preamble.',
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: item.voice }
              }
            }
          }
        });

        const b64 = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (b64) {
          fs.writeFileSync(wavPath, Buffer.from(b64, 'base64'));
          // Convert to high-compatibility 44.1kHz MP3
          execSync(`ffmpeg -y -i "${wavPath}" -ar 44100 -ac 2 -b:a 128k "${mp3Path}" < /dev/null`, { stdio: 'ignore' });
          console.log(`  -> Successfully saved ${item.id}.wav and ${item.id}.mp3 with ${model}`);
          success = true;
          break;
        }
      } catch (err) {
        console.warn(`  -> Model ${model} failed for ${item.id}:`, err.message?.slice(0, 100));
      }
    }

    if (!success) {
      console.error(`  -> All models failed for ${item.id}`);
    }

    // Delay between requests
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log('All pure-text voice phrases regenerated successfully!');
}

main().catch(console.error);
