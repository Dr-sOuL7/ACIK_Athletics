import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    content = content.replace(/\/results\/announcements/g, '/announcements');
    content = content.replace(/\/results\/events/g, '/events');
    content = content.replace(/\/results\/rankings/g, '/rankings');
    content = content.replace(/\/results\/homepage/g, '/homepage');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', filePath);
    }
  }
});
