import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SONGS_DIR = path.join(__dirname, '../public/songs');
const SECURE_SONGS_DIR = path.join(__dirname, '../public/songs-secure');
const BGM_DIR = path.join(__dirname, '../public/bgm');
const SECURE_BGM_DIR = path.join(__dirname, '../public/bgm-secure');
const KEY = 0xAA; // Simple XOR key

const encryptDirectory = (inputDir, outputDir) => {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.readdir(inputDir, (err, files) => {
        if (err) {
            console.error(`Error reading ${inputDir}:`, err);
            return;
        }

        files.forEach(file => {
            if (path.extname(file) === '.mp3') {
                const inputPath = path.join(inputDir, file);
                const outputPath = path.join(outputDir, file);

                try {
                    const data = fs.readFileSync(inputPath);
                    const encryptedData = Buffer.alloc(data.length);

                    for (let i = 0; i < data.length; i++) {
                        encryptedData[i] = data[i] ^ KEY;
                    }

                    fs.writeFileSync(outputPath, encryptedData);
                    console.log(`Encrypted: ${file}`);
                } catch (e) {
                    console.error(`Failed to encrypt ${file}:`, e);
                }
            }
        });
    });
};

console.log('Starting audio encryption...');
encryptDirectory(SONGS_DIR, SECURE_SONGS_DIR);
encryptDirectory(BGM_DIR, SECURE_BGM_DIR);
console.log('Encryption tasks initiated...');
