const fetch = require('node-fetch');

const colleges = [
  "Chanakya National Law University",
  "Rajendra Agricultural University",
  "IHM Patna",
  "Patna University",
  "Hidayatullah National Law University",
  "Indira Gandhi Krishi Vishwavidyalaya",
  "IIT Madras",
  "IIT Bombay",
  "Sacred Heart College Tirupattur"
];

async function test() {
  for (let name of colleges) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(name)}&gsrlimit=1&prop=pageimages&pithumbsize=200&format=json`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log(`\nCollege: ${name}`);
      if (data.query && data.query.pages) {
        const pageId = Object.keys(data.query.pages)[0];
        const page = data.query.pages[pageId];
        console.log(`Page Title: ${page.title}`);
        if (page.thumbnail) {
          console.log(`Thumbnail URL: ${page.thumbnail.source}`);
        } else {
          console.log(`No thumbnail found for page.`);
        }
      } else {
        console.log(`No search results.`);
      }
    } catch (e) {
      console.log(`Error testing ${name}: ${e.message}`);
    }
  }
}

test();
