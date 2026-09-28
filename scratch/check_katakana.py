import json
import glob
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

for p in sorted(glob.glob('src/data/*.json')):
    with open(p, encoding='utf-8') as f:
        d = json.load(f)
        words = d.get('words', [])
        katakana_count = sum(1 for w in words if re.search(r'[\u30a0-\u30ff]', w['word']))
        print(f"{d['lesson_id']} ({d['lesson_name']}): total={len(words)}, katakana_words={katakana_count}")
        # Find sample words
        sample_words = [w['word'] for w in words[:5]]
        print(f"   First 5: {', '.join(sample_words)}")
