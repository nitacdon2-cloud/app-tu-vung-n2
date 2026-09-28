import json, glob, os, sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== REMAINING PLACEHOLDER MEANINGS ===")
for f in sorted(glob.glob('src/data/lesson_*.json')):
    with open(f, 'r', encoding='utf-8') as fp:
        d = json.load(fp)
        for w in d.get('words', []):
            m = w.get('meaning', '').strip()
            if 'Tiền tố / Hậu tố N2' in m:
                print(f"{os.path.basename(f)} #{w['id']}: word='{w['word']}' | reading='{w['reading']}'")

print("\n=== REMAINING EXAMPLES WITH EMPTY VI ===")
empty_vi_count = 0
for f in sorted(glob.glob('src/data/lesson_*.json')):
    with open(f, 'r', encoding='utf-8') as fp:
        d = json.load(fp)
        for w in d.get('words', []):
            for ex in w.get('examples', []):
                if not ex.get('vi', '').strip():
                    empty_vi_count += 1
                    if empty_vi_count <= 25:
                        print(f"{os.path.basename(f)} word='{w['word']}': ja='{ex['ja']}'")

print(f"\nTotal empty VI translations: {empty_vi_count}")
