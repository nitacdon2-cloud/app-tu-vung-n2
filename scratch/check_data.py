import json
import glob
import sys

sys.stdout.reconfigure(encoding='utf-8')

for p in sorted(glob.glob('src/data/*.json')):
    with open(p, encoding='utf-8') as f:
        d = json.load(f)
        words = d.get('words', [])
        print(f"{p}: id={d.get('lesson_id')} | name={d.get('lesson_name')} | count={len(words)}")
        if words:
            print(f"   First: #{words[0]['id']} {words[0]['word']}")
            print(f"   Last:  #{words[-1]['id']} {words[-1]['word']}")
