import fitz
import sys
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'c:\Users\k.trinh.minh.trai\Documents\YouTube\2. VIP 15 N2_HỌC VIÊN\1. CHẶNG 1 (KIẾN THỨC NỀN TẢNG N2)\FILE SÁCH KANJI - TV - NP N2 (PDF)\PDF TỪ VỰNG N2\N2 - từ vựng 201223.pdf'
doc = fitz.open(pdf_path)

# Load existing words
all_words = {}
for i in range(1, 11):
    with open(f'src/data/lesson_{i:02d}.json', 'r', encoding='utf-8') as fp:
        d = json.load(fp)
    for w in d['words']:
        all_words[w['id']] = w

# Search for exact word number headings in PDF
# Let's inspect where 1.1, 1.2, 1.3... are located and which word ID follows them!
for p_idx in range(2, len(doc)):
    page_num = p_idx + 1
    text = doc[p_idx].get_text()
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    
    # Check if this page has a section header
    for idx, l in enumerate(lines[:12]):
        # Match section patterns
        m = re.match(r'^(?:[^\d]*?)(\d+\.\d+)(.*)', l)
        if m:
            sec_num = m.group(1)
            extra = m.group(2).strip()
            # print surrounding lines
            print(f"P{page_num:3d} (Book P{lines[0]}): Section {sec_num} ({extra}) -> next lines: {lines[idx+1:idx+6]}")
            break
        elif '4 い形容詞' in l:
            print(f"P{page_num:3d} (Book P{lines[0]}): Section 4.1 (い形容詞) -> next lines: {lines[idx+1:idx+6]}")
            break
        elif 'な形容詞 5.1' in l:
            print(f"P{page_num:3d} (Book P{lines[0]}): Section 5.1 (な形容詞) -> next lines: {lines[idx+1:idx+6]}")
            break
        elif 'まとめ 9' in l:
            print(f"P{page_num:3d} (Book P{lines[0]}): Section 9.1 (まとめ) -> next lines: {lines[idx+1:idx+6]}")
            break
