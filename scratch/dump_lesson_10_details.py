import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/lesson_10.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total words in lesson 10: {len(data['words'])}")
for idx, w in enumerate(data['words']):
    sub = w.get('sub_header', '')
    is_p = w.get('is_parent', False)
    p_id = w.get('parent_id', None)
    w_id = w.get('id')
    word = w.get('word', '')
    read = w.get('reading', '')
    mean = w.get('meaning', '')
    gram = w.get('grammar_equiv', '')
    print(f"{idx+1:3d}. ID:{w_id:4d} | Parent:{str(is_p):5s} (p_id={p_id}) | Word:{word:25s} | Read:{read:15s} | Sub:{sub:15s} | Gram:{gram:12s} | Mean:{mean}")
