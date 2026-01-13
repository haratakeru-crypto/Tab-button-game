const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'Word画像');
const destDir = path.join(__dirname, '..', 'public', 'Word画像');

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// 画像ファイルをコピー
const sourceFile = path.join(sourceDir, 'Word画面.png');
const destFile = path.join(destDir, 'Word画面.png');

if (fs.existsSync(sourceFile)) {
  fs.copyFileSync(sourceFile, destFile);
  console.log('画像ファイルをコピーしました:', destFile);
} else {
  console.error('ソースファイルが見つかりません:', sourceFile);
}
