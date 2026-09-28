import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/lesson_10.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

words = d['words']
print('Total words in lesson 10:', len(words))

# Check for corrupted strings
corrupted = []
for w in words:
    ws = json.dumps(w, ensure_ascii=False)
    if any(k in ws for k in ['Mộtít', 'Caomột', 'Thờiđiểm', '風に', 'スチール製の机']):
        corrupted.append(w)

print('Corrupted items found:', len(corrupted))

print('\nChapter 10 words (Phân biệt từ vựng):')
ch10 = [w for w in words if '10.' in w.get('sub_section', '')]
print(f'Total Ch10 words: {len(ch10)}')
for w in ch10:
    print(f"  {w['id']}: [{w.get('sub_section')}] {w['word']} ({w['reading']}) - {w['meaning']}")

print('\nChapter 11 Parent Cards (Tiền tố & Hậu tố):')
parents = [w for w in words if w.get('is_parent_header')]
print(f'Total Parent Cards: {len(parents)}')
for w in parents:
    print(f"  {w['id']}: [{w.get('word_type')}] {w['word']} ({w['reading']}) | Grammar: {w.get('grammar_equiv')} | Meaning: {w['meaning']}")
