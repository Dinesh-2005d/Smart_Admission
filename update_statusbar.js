const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src', 'screens');
let files = fs.readdirSync(screensDir).filter(f => f.endsWith('.js')).map(f => path.join(screensDir, f));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('barStyle="light-content"')) {
    content = content.replace(/barStyle="light-content"/g, 'barStyle="dark-content"');
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated barStyle in ${path.basename(file)}`);
  }
}
