const fetch = require('node-fetch');

const W = (filename) =>
  `https://en.wikipedia.org/w/index.php?title=Special:Redirect/file/${encodeURIComponent(filename)}&width=200`;

const urls = [
  W('Chanakya_National_Law_University_logo.png'),
  W('Rajendra_Agricultural_University_logo.png'),
  W('Architecture_College_Patna_logo.png'),
  W('IHM_Patna_logo.png'),
  W('IIT_Madras_Logo.svg'),
  W('IIT_Bombay_Logo.svg'),
];

async function test() {
  for (let url of urls) {
    try {
      const res = await fetch(url);
      console.log(`URL: ${url}`);
      console.log(`Status: ${res.status}`);
    } catch (e) {
      console.log(`URL: ${url} failed with error: ${e.message}`);
    }
  }
}

test();
