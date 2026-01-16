const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'Excel画像');
const destDir = path.join(__dirname, '..', 'public', 'Excel画像');

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// ソースディレクトリが存在しない場合はエラー
if (!fs.existsSync(sourceDir)) {
  console.error('ソースディレクトリが見つかりません:', sourceDir);
  process.exit(1);
}

// すべてのPNGファイルをコピー
try {
  const files = fs.readdirSync(sourceDir);
  const pngFiles = files.filter(file => file.toLowerCase().endsWith('.png'));
  
  if (pngFiles.length === 0) {
    console.warn('PNGファイルが見つかりませんでした:', sourceDir);
  } else {
    let copiedCount = 0;
    pngFiles.forEach(file => {
      const sourceFile = path.join(sourceDir, file);
      const destFile = path.join(destDir, file);
      
      try {
        fs.copyFileSync(sourceFile, destFile);
        console.log(`Copied: ${file}`);
        copiedCount++;
      } catch (error) {
        console.error(`Failed: ${file}`, error.message);
      }
    });
    console.log(`\nTotal: ${copiedCount} / ${pngFiles.length} files copied.`);
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
