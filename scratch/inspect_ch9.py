import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/lesson_10.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

print('First 10 words in lesson 10:')
for w in d['words'][:10]:
    print(f"  id={w['id']}, word={w['word']}, reading={w['reading']}")

print('\nKey Chapter 9 markers:')
for w in d['words']:
    word = w.get('word', '')
    if any(k in word for k in ['改定', '一人前', '増員', '減量', '一流']):
        print(f"  id={w['id']}, word={word}, reading={w.get('reading')}, sub={w.get('sub_section')}")
