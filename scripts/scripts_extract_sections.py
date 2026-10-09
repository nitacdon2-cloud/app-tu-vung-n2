import fitz
import sys
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'c:\Users\k.trinh.minh.trai\Documents\YouTube\2. VIP 15 N2_HỌC VIÊN\1. CHẶNG 1 (KIẾN THỨC NỀN TẢNG N2)\FILE SÁCH KANJI - TV - NP N2 (PDF)\PDF TỪ VỰNG N2\N2 - từ vựng 201223.pdf'
doc = fitz.open(pdf_path)

# Load existing 1382 words from src/data/lesson_*.json
all_words = {}
for i in range(1, 11):
    fn = f'src/data/lesson_{i:02d}.json'
    with open(fn, 'r', encoding='utf-8') as fp:
        data = json.load(fp)
    for w in data['words']:
        all_words[w['id']] = w

print(f"Total existing words loaded: {len(all_words)}")

# Scan pages for section headers
# In the book, each page top has headers like:
# '1 章', '動詞1.1', or '1.2'
# and rows of words, each starting with word number (1, 2, ..., 1382)
page_sections = []
current_chapter = None
current_section = None

for p_idx in range(2, len(doc)):
    page_num = p_idx + 1
    text = doc[p_idx].get_text()
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    
    # Detect section
    detected = None
    for l in lines[:10]:
        # Match X.Y (e.g. 1.1, 1.2, 10.1, 11.11, etc.)
        m = re.search(r'(\d+\.\d+)', l)
        if m:
            detected = m.group(1)
            break
        # Special cases like "4 い形容詞" or "9 章 まとめ"
        if '4 い形容詞' in l:
            detected = '4.1'
            break
        if '9 章' in l and ('まとめ' in text[:200] or p_idx in [122, 123]):
            detected = '9.1'
            break

    # Detect word ids on this page
    # Words in table have number before the word
    w_ids = []
    for idx, l in enumerate(lines):
        if re.match(r'^\d+$', l):
            val = int(l)
            if val in all_words:
                w_ids.append(val)

    page_sections.append({
        'page': page_num,
        'detected_section': detected,
        'top_lines': lines[:8],
        'word_ids': w_ids
    })

print(f"Scanned {len(page_sections)} pages.")
with open('scripts_page_sections.json', 'w', encoding='utf-8') as fp:
    json.dump(page_sections, fp, ensure_ascii=False, indent=2)
