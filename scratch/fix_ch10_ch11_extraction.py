import pymupdf as fitz
import sys
import os
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

import pykakasi
kks = pykakasi.kakasi()

def get_sentence_reading(sentence):
    if not sentence:
        return ""
    try:
        res = kks.convert(sentence)
        return ''.join([item['hira'] for item in res])
    except Exception:
        return ""

PREFERRED_HV = {
    '引': 'DẪN', '打': 'ĐẢ', '計': 'KẾ', '量': 'LƯỢNG', '齧': 'NIẾT',
    '静': 'TĨNH', '躓': 'CHÍ', '頷': 'HÀM', '吐': 'THỔ', '傷': 'THƯƠNG',
    '見': 'KIẾN', '舞': 'VŨ', '転': 'CHUYỂN', '配': 'PHỐI', '放': 'PHÓNG',
    '床': 'SÀN', '切': 'THIẾT', '重': 'TRỌNG', '空': 'KHÔNG', '行': 'HÀNH',
    '生': 'SINH', '相': 'TƯƠNG', '場': 'TRƯỜNG', '分': 'PHÂN', '長': 'TRƯỜNG'
}

def get_han_viet(word_str):
    if not word_str:
        return ""
    hv_chars = []
    for ch in word_str:
        if '\u4e00' <= ch <= '\u9fff':
            hv = PREFERRED_HV.get(ch, "")
            if hv:
                hv_chars.append(hv)
    return ' '.join(hv_chars) if hv_chars else ""

pdf_path = os.path.join('FILE SÁCH KANJI - TV - NP N2 (PDF)', 'PDF TỪ VỰNG N2', 'N2 - từ vựng 201223.pdf')
doc = fitz.open(pdf_path)

# Pages 125 to 139 are Chapter 10 (0-indexed 124 to 138)
def parse_ch10():
    all_ch10_words = []
    for page_idx in range(124, 139):
        page = doc[page_idx]
        blocks = page.get_text("blocks")
        lines = []
        for b in blocks:
            text = b[4].strip()
            if text:
                for line in text.splitlines():
                    l = line.strip()
                    if l:
                        lines.append(l)
        
        # Parse lines into words and sub-meanings
        current_sub = "10.1"
        current_word = None
        current_reading = ""
        current_meanings = []
        
        for l in lines:
            if re.match(r'^\d{1,2}\.\d{1,2}', l):
                current_sub = re.match(r'^\d{1,2}\.\d{1,2}', l).group(0)
                continue
            if l in ['10 章', '章', '10']:
                continue
            if l.isdigit() and len(l) <= 3: # page number
                continue
            
            # Check if line is sub-definition number e.g. ①, ②, ③, ④
            m_subdef = re.match(r'^([①②③④⑤⑥⑦⑧⑨⑩])\s*(.*)', l)
            if m_subdef:
                num_symbol = m_subdef.group(1)
                meaning_text = m_subdef.group(2).strip()
                if current_word:
                    current_meanings.append(f"{num_symbol} {meaning_text}")
            elif l.startswith('・'):
                # Example line, skip or store
                continue
            elif any('\u3040' <= c <= '\u30ff' or '\u4e00' <= c <= '\u9fff' for c in l) and len(l) <= 20 and not l.startswith('・'):
                # If we encounter a new main word (e.g. あっさり, さっぱり, すっかり, 犯す)
                if current_word and current_meanings:
                    all_ch10_words.append({
                        "word": current_word,
                        "reading": current_reading if current_reading else get_sentence_reading(current_word),
                        "han_viet": get_han_viet(current_word),
                        "word_type": "Phân biệt từ vựng",
                        "meaning": ' '.join(current_meanings),
                        "sub_section": f"{current_sub} Phân biệt từ vựng"
                    })
                current_word = l
                current_reading = get_sentence_reading(l)
                current_meanings = []
            elif current_word and not current_meanings and not l.startswith('・'):
                # Secondary line of meaning or reading
                if not any(c in '①②③④⑤⑥⑦⑧⑨⑩' for c in l):
                    current_meanings.append(l)

        if current_word and current_meanings:
            all_ch10_words.append({
                "word": current_word,
                "reading": current_reading if current_reading else get_sentence_reading(current_word),
                "han_viet": get_han_viet(current_word),
                "word_type": "Phân biệt từ vựng",
                "meaning": ' '.join(current_meanings),
                "sub_section": f"{current_sub} Phân biệt từ vựng"
            })

    return all_ch10_words

ch10_words = parse_ch10()
print(f"Extracted Chapter 10 words: {len(ch10_words)}")
for w in ch10_words[:10]:
    print(f"  Word: {w['word']} ({w['reading']}) | Meaning: {w['meaning']}")
