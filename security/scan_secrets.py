import os, re

patterns = [
    (r'Bearer [A-Za-z0-9\-_\.]{20,}', 'Bearer token hardcoded'),
    (r'api[_-]?key\s*[=:]\s*["\'][^"\']{8,}["\']', 'hardcoded api key'),
    (r'gsk_[A-Za-z0-9]{20,}', 'Groq API key'),
    (r'sk-[A-Za-z0-9]{20,}', 'OpenAI key'),
    (r'AAAA[A-Za-z0-9+/]{50,}', 'potential token'),
    (r'Authorization.*Bearer', 'Authorization Bearer pattern'),
]
skip_dirs = {'node_modules', '.expo', 'dist', 'build', '.git', 'reports', '__pycache__'}
skip_exts = {'.png','.jpg','.ico','.svg','.zip','.lock','.map','.woff','.ttf'}

found = []
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in skip_dirs]
    for fname in files:
        if any(fname.endswith(e) for e in skip_exts): continue
        fpath = os.path.join(root, fname)
        try:
            content = open(fpath, encoding='utf-8', errors='ignore').read()
            for pat, label in patterns:
                for m in re.finditer(pat, content, re.IGNORECASE):
                    line_no = content[:m.start()].count('\n') + 1
                    found.append(f'{fpath}:{line_no} [{label}]: {m.group()[:80]}')
        except Exception as e:
            pass

if found:
    print("POTENTIAL SECRET PATTERNS FOUND:")
    for f in found:
        print(" ", f)
else:
    print("No secret patterns found - code is clean!")
