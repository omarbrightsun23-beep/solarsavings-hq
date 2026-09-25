const fs = require('fs');
const path = require('path');
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(child => copyRecursive(path.join(src, child), path.join(dest, child)));
  } else {
    fs.writeFileSync(dest, fs.readFileSync(src));
  }
}
['css', 'js', 'assets'].forEach(dir => {
  const src = path.join(__dirname, dir);
  if (fs.existsSync(src)) copyRecursive(src, path.join(distDir, dir));
});
fs.readdirSync(__dirname).forEach(file => {
  if (file !== 'dist' && file !== 'node_modules' && !file.startsWith('.')) {
    const src = path.join(__dirname, file);
    if (fs.statSync(src).isFile()) {
      fs.writeFileSync(path.join(distDir, file), fs.readFileSync(src));
    }
  }
});
console.log('Build complete: assets populated to dist/');
