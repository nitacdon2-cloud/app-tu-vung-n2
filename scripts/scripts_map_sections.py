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

# For each page, let's find the first word ID on that page and any section header on that page
sections_found = []

for p_idx in range(2, len(doc)):
    page_num = p_idx + 1
    text = doc[p_idx].get_text()
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    
    sec_tag = None
    sec_title = None
    
    # Check lines for section definition
    for l in lines[:10]:
        # Chapter 10: e.g. "10.1 - あっさり・さっぱり・すっかり"
        m10 = re.match(r'^(10\.\d+)\s*[-–]\s*(.*)', l)
        if m10:
            sec_tag = m10.group(1)
            sec_title = m10.group(2).strip()
            break
        # Chapter 11: e.g. "11.1 - 不・無・非・未"
        m11 = re.match(r'^(11\.\d+)\s*[-–]\s*(.*)', l)
        if m11:
            sec_tag = m11.group(1)
            sec_title = m11.group(2).strip()
            break
        # Other X.Y
        m = re.search(r'([^\d]|^)(\d+\.\d+)\b', l)
        if m:
            val = m.group(2)
            # ignore 38.5 or temperature or similar
            if float(val) < 12:
                sec_tag = val
                sec_title = l
                break
        if '4 い形容詞' in l:
            sec_tag = '4.1'
            sec_title = '4.1 い形容詞'
            break
        if 'な形容詞 5.1' in l or '5.1' in l:
            sec_tag = '5.1'
            sec_title = '5.1 な形容詞'
            break
        if 'まとめ 9' in l or 'まとめ9' in l:
            sec_tag = '9.1'
            sec_title = '9.1 まとめ'
            break

    # Find the word IDs listed on this page
    # In table: word ID is an integer
    w_ids = []
    for l in lines:
        if re.match(r'^\d+$', l):
            v = int(l)
            if v in all_words:
                w_ids.append(v)
    
    if sec_tag:
        first_w = min(w_ids) if w_ids else None
        sections_found.append({
            'page': page_num,
            'sec_tag': sec_tag,
            'sec_title': sec_title,
            'first_word_id': first_w,
            'w_ids': w_ids
        })

print(f"Total section points found: {len(sections_found)}")
for s in sections_found:
    print(f"P{s['page']:3d} | Sec {s['sec_tag']:6s} | first_w={s['first_word_id']} | title: {s['sec_title']}")
