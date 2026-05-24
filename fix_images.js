const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // import ekle (zaten import api varsa yanına ekle, yoksa services/api.ts den ekle)
  if (content.includes('event.coverImage') || content.includes('app.event.coverImage')) {
    if (!content.includes('getImageUrl')) {
      // Find a good place to import
      // Determine path depth
      const depth = filePath.split(/\\|\//).length - 6; // src/app/components -> depth 0 => '../../services/api'
      const relativeDots = depth === 0 ? '../../services/api' : (depth === 1 ? '../../../services/api' : '../services/api');
      
      content = `import { getImageUrl } from '${relativeDots}';\n` + content;
      changed = true;
    }

    // Replace <img src={event.coverImage}
    content = content.replace(/src=\{event\.coverImage\}/g, 'src={getImageUrl(event.coverImage)}');
    content = content.replace(/src=\{app\.event\.coverImage\}/g, 'src={getImageUrl(app.event.coverImage)}');
    content = content.replace(/src=\{app\.event\?\.coverImage\}/g, 'src={getImageUrl(app.event?.coverImage)}');

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', filePath);
    }
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      replaceInFile(fullPath);
    }
  }
}

traverse(path.join(__dirname, 'frontend/src/app/components'));
