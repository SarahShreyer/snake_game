import { resolve } from 'path';
import { copyFileSync, existsSync, mkdirSync } from 'fs';

const assets = ['bg.mp3', 'death.wav', 'bite.mp3'];
const outDir = resolve('server/public');

if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

assets.forEach(asset => {
  const srcPath = resolve(asset);
  const destPath = resolve(outDir, asset);
  if (existsSync(srcPath)) {
    copyFileSync(srcPath, destPath);
    console.log(`Copied ${asset} to ${outDir}`);
  } else {
    console.warn(`Asset not found: ${srcPath}`);
  }
});