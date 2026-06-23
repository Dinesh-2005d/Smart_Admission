const fs = require('fs');
const path = require('path');

const collegesPath = path.join(__dirname, 'src', 'constants', 'colleges_compressed.json');
const rawData = fs.readFileSync(collegesPath, 'utf8');
const colleges = JSON.parse(rawData);

console.log('Total colleges in compressed JSON:', colleges.length);
console.log('Sample record 0:', JSON.stringify(colleges[0], null, 2));
console.log('Sample record 1:', JSON.stringify(colleges[1], null, 2));
console.log('Sample record 2:', JSON.stringify(colleges[2], null, 2));

let withDomain = 0;
for (let i = 0; i < colleges.length; i++) {
  if (colleges[i][9]) {
    withDomain++;
  }
}
console.log('Colleges with non-empty domain column (index 9):', withDomain);
