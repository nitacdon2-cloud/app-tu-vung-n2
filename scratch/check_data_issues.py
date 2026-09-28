import json
import glob
import sys

sys.stdout.reconfigure(encoding='utf-8')

for path in sorted(glob.glob('src/data/lesson_*.json')):
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    words = data.get('words', [])
    print(f'{path}: {len(words)} words')
    for w in words:
        w_str = json.dumps(w, ensure_ascii=False)
        if any(k in w_str for k in ['Mộtít', 'Caomột', 'Thờiđiểm', '風に', 'スチール', 'こう発風に']):
            print(f"  [{path}] id={w.get('id')}, word={w.get('word')}, reading={w.get('reading')}, meaning={w.get('meaning')}")
