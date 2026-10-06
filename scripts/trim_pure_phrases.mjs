import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const phrasesDir = path.resolve(__dirname, '../public/audio/phrases');
const backupDir = path.resolve(__dirname, '../public/audio/phrases_raw_backup');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Map each phrase to its exact start timestamp where the preamble finishes and the actual spoken phrase begins
const trimMap = [
  { id: 'c1', start: 0.0, text: '叔叔阿姨快点出牌呀，我等得花儿都谢啦！' }, // Already pure
  { id: 'c3', start: 4.75, text: '叔叔阿姨好！我还是个孩子，你们可不能打我枪哦！' },
  { id: 'c2', start: 4.10, text: '哇！我拿到超级厉害的无敌神牌啦！' },
  { id: 'c4', start: 3.18, text: '耶！赢了赢了，我要拿水数买超级大糖果！' },
  { id: 'm1', start: 3.70, text: '准备好水数，这把我要通杀全场！' },
  { id: 'm2', start: 3.28, text: '这把牌太神，我都不好意思赢你们！' },
  { id: 'm3', start: 3.70, text: '牌好任性！全场消费由本少爷买单！' },
  { id: 'cui1', start: 3.08, text: '快点出牌啊，我等得花儿都谢了！' },
  { id: 'r1', start: 3.42, text: '别磨叽了！快点出牌！老子等不及了！' },
  { id: 'r2', start: 3.38, text: '气死我了！连续三把乌龙，老子要逆天！' },
  { id: 'e1', start: 6.00, text: '老夫玩十三水的时候，你们还在抓泥巴呢！' },
  { id: 'e4', start: 5.88, text: '出牌慢一点，老人家眼睛有点花咯～' },
  { id: 's1', start: 4.24, text: '哥哥手下留情嘛，人家不想输水水～' },
  { id: 'f1', start: 7.00, text: '姐姐劝你早点认输，少输几道水！' },
  { id: 'qr1', start: 3.65, text: '手下留情，别打我枪啊大佬！' },
  { id: 'g1', start: 2.90, text: '以为我要起飞，结果我是小丑！' }
];

console.log('Starting precision audio trimming to remove preamble instructions...');

for (const item of trimMap) {
  const srcWav = path.join(phrasesDir, `${item.id}.wav`);
  const srcMp3 = path.join(phrasesDir, `${item.id}.mp3`);
  const backupFile = path.join(backupDir, `${item.id}.mp3`);

  // Back up original if not already backed up
  if (!fs.existsSync(backupFile) && fs.existsSync(srcMp3)) {
    fs.copyFileSync(srcMp3, backupFile);
  }

  const sourceAudio = fs.existsSync(backupFile) ? backupFile : (fs.existsSync(srcWav) ? srcWav : srcMp3);

  console.log(`Processing ${item.id}: starting at ${item.start}s for "${item.text}"`);

  if (item.start > 0) {
    const tempWav = path.join(phrasesDir, `${item.id}_trimmed.wav`);
    const tempMp3 = path.join(phrasesDir, `${item.id}_trimmed.mp3`);

    // Trim with smooth 0.05s fade-in to eliminate click, retain full pristine audio
    execSync(`ffmpeg -y -ss ${item.start} -i "${sourceAudio}" -af "afade=t=in:ss=0:d=0.05" -ar 24000 "${tempWav}" < /dev/null`, { stdio: 'ignore' });
    execSync(`ffmpeg -y -i "${tempWav}" -ar 44100 -ac 2 -b:a 128k "${tempMp3}" < /dev/null`, { stdio: 'ignore' });

    fs.renameSync(tempWav, srcWav);
    fs.renameSync(tempMp3, srcMp3);
  } else {
    // Already pure text (c1), make sure wav and mp3 are synchronized
    if (fs.existsSync(srcWav) && fs.existsSync(srcMp3)) {
      console.log(`  -> ${item.id} already pure`);
    }
  }

  const newDur = execSync(`ffprobe -i "${srcMp3}" -show_entries format=duration -v quiet -of csv="p=0"`).toString().trim();
  console.log(`  -> ${item.id}.mp3 trimmed length: ${parseFloat(newDur).toFixed(2)}s`);
}

console.log('All 16 phrases successfully trimmed to clean pure spoken text!');
