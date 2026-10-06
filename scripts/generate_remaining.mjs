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

const remaining = [
  {
    id: 'r1',
    voice: 'Fenrir',
    prompt: '以粗暴凶悍的大汉怒吼咆哮道：别磨叽了！快点出牌！老子等不及了！'
  },
  {
    id: 'e1',
    voice: 'Fenrir',
    prompt: '以八十岁老神仙老翁沧桑缓慢的声音慢悠悠地说：老夫玩十三水的时候，你们还在抓泥巴呢！'
  },
  {
    id: 's1',
    voice: 'Kore',
    prompt: '以极其娇滴滴、软萌撒娇的小萝莉少女声音求饶说：哥哥手下留情嘛，人家不想输水水～'
  },
  {
    id: 'f1',
    voice: 'Kore',
    prompt: '以成熟干练冷艳的御姐女声冷笑自信说道：姐姐劝你早点认输，少输几道水！'
  },
  {
    id: 'r2',
    voice: 'Fenrir',
    prompt: '以气急败坏的大汉咆哮怒吼道：气死我了！连续三把乌龙，老子要逆天！'
  },
  {
    id: 'e4',
    voice: 'Fenrir',
    prompt: '以和蔼可亲、眼花耳背的白发老爷爷声音慢吞吞地说：出牌慢一点，老人家眼睛有点花咯～'
  },
  {
    id: 'qr1',
    voice: 'Puck',
    prompt: '以搞笑求饶的年轻菜鸟男声大喊道：手下留情，别打我枪啊大佬！'
  }
];

async function generateWithRetry(p) {
  const targetFile = path.join(outDir, `${p.id}.wav`);
  if (fs.existsSync(targetFile) && fs.statSync(targetFile).size > 1000) {
    console.log(`[SKIP] Already exists: ${p.id}.wav`);
    return;
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`Generating ${p.id} (${p.voice}), attempt ${attempt}...`);
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [{ role: 'user', parts: [{ text: p.prompt }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: p.voice } }
          }
        }
      });

      const b64 = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (b64) {
        fs.writeFileSync(targetFile, Buffer.from(b64, 'base64'));
        console.log(`  -> Successfully saved ${p.id}.wav (${b64.length} bytes)`);
        return;
      }
    } catch (err) {
      console.warn(`  -> Error on ${p.id}:`, err.message);
      if (err.message.includes('quota') || err.message.includes('429')) {
        console.log('  -> Waiting 25s for quota reset...');
        await new Promise((r) => setTimeout(r, 25000));
      }
    }
  }
}

async function main() {
  console.log(`Generating ${remaining.length} remaining phrases...`);
  for (let i = 0; i < remaining.length; i++) {
    const p = remaining[i];
    await generateWithRetry(p);
    // Wait 22s between requests to stay strictly below 3 RPM free limit
    console.log(`Waiting 22s before next phrase...`);
    await new Promise((r) => setTimeout(r, 22000));
  }
  console.log('All remaining phrases generated!');
}

main().catch(console.error);
