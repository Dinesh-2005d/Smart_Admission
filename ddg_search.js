const fetch = require('node-fetch');

async function searchDDGDomain(name) {
  const query = `${name} official website`;
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    if (res.status !== 200) return null;
    const html = await res.text();
    
    // DuckDuckGo HTML results use class "result__url" or <a class="result__snippet" href="...">
    // Let's find links inside result__snippet or result__url
    const hrefRegex = /class="result__url"[^>]*href="([^"]+)"/g;
    let match;
    const domains = [];
    while ((match = hrefRegex.exec(html)) !== null) {
      let href = match[1];
      // Decode duckduckgo redirect URL if necessary: e.g. //duckduckgo.com/l/?uddg=https%3A%2F%2Fwww.domain.com%2F...
      if (href.includes('uddg=')) {
        const parts = href.split('uddg=');
        if (parts.length > 1) {
          href = decodeURIComponent(parts[1].split('&')[0]);
        }
      }
      try {
        const urlObj = new URL(href);
        let hostname = urlObj.hostname;
        if (hostname.startsWith('www.')) {
          hostname = hostname.substring(4);
        }
        if (hostname && !hostname.includes('duckduckgo.com')) {
          domains.push(hostname);
        }
      } catch (e) {
        // Ignore
      }
    }
    return domains.length > 0 ? domains[0] : null;
  } catch (e) {
    console.error(`DDG search failed for ${name}:`, e.message);
  }
  return null;
}

const colleges = [
  "Rajendra Agricultural University",
  "Architecture College Patna",
  "IHM Patna",
  "Bihar Paramedical College",
  "Government Polytechnic Patna",
];

async function test() {
  for (let c of colleges) {
    const domain = await searchDDGDomain(c);
    console.log(`${c} -> ${domain}`);
    await new Promise(r => setTimeout(r, 1000));
  }
}

test();
