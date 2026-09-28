import os
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

data_dir = os.path.join('src', 'data')
files = sorted([f for f in os.listdir(data_dir) if f.endswith('.json')])

total_words = 0
print(f"Found {len(files)} JSON files in {data_dir}:\n")

for f in files:
    fpath = os.path.join(data_dir, f)
    with open(fpath, 'r', encoding='utf-8') as fp:
        data = json.load(fp)
        lid = data.get("lesson_id")
        lname = data.get("lesson_name")
        words = data.get("words", [])
        total_words += len(words)
        print(f"✅ {f}: ID='{lid}', Title='{lname}', Words={len(words)}")
        
        # Sample word
        if words:
            w1 = words[0]
            w_last = words[-1]
            print(f"   First word: {w1['word']} ({w1['reading']}) - {w1['meaning'][:30]}")
            print(f"   Last word:  {w_last['word']} ({w_last['reading']}) - {w_last['meaning'][:30]}")

print(f"\nGRAND TOTAL WORDS ACROSS 10 LESSONS: {total_words}")
