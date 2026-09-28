import sys
import json
import os

sys.stdout.reconfigure(encoding='utf-8')

for l_num in ['09', '10']:
    fpath = f'src/data/lesson_{l_num}.json'
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f'=== LESSON {l_num} ===')
    for w in data['words']:
        if any(prefix in w['word'] for prefix in ['不', '無', '非', '未', '再', '超', '高', '各', '長', '副', '名', '全', '総', '的', '風', '感', '性', '製', '金', '代', '料', '賃']):
            print(f"ID {w['id']}: {w['word']} ({w['reading']}) -> {w['meaning']}")
