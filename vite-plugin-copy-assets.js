import { resolve } from 'path';
import { copyFileSync, existsSync, mkdirSync } from 'fs';

export default function copyAssetsPlugin() {
  return {
    name: 'copy-assets',
    writeBundle() {
      const assets = ['bg.mp3', 'death.wav', 'bite.mp3'];
      const outDir = resolve(__dirname, 'server/public');

      if (!existsSync(outDir)) {
        mkdirSync(outDir, { recursive: true });
      }

      assets.forEach(asset => {
        const srcPath = resolve(__dirname, asset);
        const destPath = resolve(outDir, asset);
        if (existsSync(srcPath)) {
          copyFileSync(srcPath, destPath);
          console.log(`Copied ${asset} to ${outDir}`);
        } else {
          console.warn(`Asset not found: ${srcPath}`);
        }
      });
    }
  };
}