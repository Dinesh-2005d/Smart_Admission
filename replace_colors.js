const fs = require('fs');
const path = require('path');

const replacements = {
  '#0d0a1a': '#ffffff', // bg: white
  '#130e28': '#f8f9fa', // card: off-white
  '#1e1035': '#f1f5f9', // alt bg: light gray
  '#1a1005': '#fffbeb', // alt bg yellow
  '#2d1f5e': '#e2e8f0', // border: light gray
  '#3b1f6e': '#cbd5e1', // alt border
  '#854d0e': '#fde047', // border yellow
  '#f1f5f9': '#0f172a', // text: black
  '#94a3b8': '#334155', // sub text
  '#475569': '#64748b', // dim text (was dark gray, mapped to lighter gray)
  '#64748b': '#475569', // another gray
  '#c084fc': '#2563eb', // purple -> vibrant blue
  '#f59e0b': '#eab308', // gold -> yellow
  '#22c55e': '#16a34a', // green -> green
  '#38bdf8': '#0284c7', // light blue -> medium blue
  '#f472b6': '#dc2626', // pink -> red
  '#fb923c': '#ea580c', // orange -> orange
  '#2dd4bf': '#0d9488', // teal -> teal
  '#a78bfa': '#3b82f6', // light purple -> blue
  '#7dd3fc': '#0ea5e9', // lighter blue -> cyan
  '#fde68a': '#ca8a04', // yellow text -> dark yellow
  '#fca5a5': '#ef4444', // red
  '#ef4444': '#b91c1c'  // dark red
};

const screensDir = path.join(__dirname, 'src', 'screens');
const appJs = path.join(__dirname, 'App.js');

let files = [];
if (fs.existsSync(screensDir)) {
  files = fs.readdirSync(screensDir).filter(f => f.endsWith('.js')).map(f => path.join(screensDir, f));
}
if (fs.existsSync(appJs)) {
  files.push(appJs);
}

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  for (const [oldColor, newColor] of Object.entries(replacements)) {
    // using regex for global case-insensitive replace
    const regex = new RegExp(oldColor, 'gi');
    if (regex.test(content)) {
      content = content.replace(regex, newColor);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${path.basename(file)}`);
  }
}
console.log('Done!');
