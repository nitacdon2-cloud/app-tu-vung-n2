"""
extract_vocab_v3.py
Comprehensive, multi-format PDF extraction engine for Japanese N2 vocabulary.

Fixes all issues from previous versions:
1. Pure integer ID filtering for Table Layout (Chapters 1-9), ignoring decimal headers like 10.1, 11.7.
2. Strict exclusion of Japanese text and bullet points '・' from Vietnamese 'meaning' fields.
3. Furigana + Kanji pairing in Chapter 10 & 11 (prevents missing Kanji like 収益 -> しゅうえき).
4. Category/Header filtering in Chapter 11 (removes false words like 11.7 - 化・目).
5. Exact example sentence parsing for all chapters.
"""
import os
import re
import json
import io
import sys
import urllib.request
import zipfile

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

import pymupdf as fitz
import pykakasi

kks = pykakasi.kakasi()

# ---------------------------------------------------------
# 1. HAN-VIET DICTIONARY
# ---------------------------------------------------------
PREFERRED_HV = {
    '引': 'DẪN', '打': 'ĐẢ', '計': 'KẾ', '量': 'LƯỢNG', '齧': 'NIẾT',
    '静': 'TĨNH', '躓': 'CHÍ', '頷': 'HÀM', '吐': 'THỔ', '傷': 'THƯƠNG',
    '見': 'KIẾN', '舞': 'VŨ', '転': 'CHUYỂN', '配': 'PHỐI', '放': 'PHÓNG',
    '床': 'SÀN', '切': 'THIẾT', '重': 'TRỌNG', '空': 'KHÔNG', '行': 'HÀNH',
    '生': 'SINH', '相': 'TƯƠNG', '場': 'TRƯỜNG', '分': 'PHÂN', '長': 'TRƯỜNG',
    '悪': 'ÁC', '強': 'CƯỜNG', '正': 'CHÍNH', '好': 'HẢO', '大': 'ĐẠI',
    '小': 'TIỂU', '高': 'CAO', '安': 'AN', '新': 'TÂN', '古': 'CỔ',
    '測': 'TRẮC', '鎮': 'TRẤN', '凹': 'AO', '凸': 'ĐỘT', '込': 'NHẬP',
    '撃': 'KÍCH', '漕': 'TÀO', '敷': 'PHU', '発': 'PHÁT', '突': 'ĐỘT',
    '儲': 'TRỪ', '溢': 'DẬT', '溺': 'NIỆU', '潰': 'HỘI', '掘': 'QUẬT',
    '躓': 'CHÍ', '頷': 'HÀM', '被': 'BỊ', '酔': 'TUÝ', '収': 'THU', '益': 'ÍCH',
    '利': 'LỢI', '期': 'KỲ', '予': 'DỰ', '算': 'TOÁN', '範': 'PHẠM', '囲': 'VI'
}

def load_han_viet_dict():
    dict_map = {}
    try:
        url_u = 'https://www.unicode.org/Public/UNIDATA/Unihan.zip'
        with urllib.request.urlopen(url_u, timeout=30) as resp:
            z = zipfile.ZipFile(io.BytesIO(resp.read()))
            readings = z.read('Unihan_Readings.txt').decode('utf-8')
            for line in readings.splitlines():
                if 'kVietnamese' in line:
                    parts = line.split('\t')
                    if len(parts) >= 3:
                        cp = int(parts[0].replace('U+', ''), 16)
                        dict_map[chr(cp)] = [parts[2].strip().upper()]
    except Exception as e:
        pass
    return dict_map

HV_DICT = load_han_viet_dict()

def get_single_kanji_hv(c):
    if c in PREFERRED_HV:
        return PREFERRED_HV[c]
    if c in HV_DICT:
        return HV_DICT[c][0]
    return ''

def get_han_viet(word_str):
    if not word_str:
        return ""
    hv_chars = []
    for ch in word_str:
        if '\u4e00' <= ch <= '\u9fff' or '\u3400' <= ch <= '\u4dbf':
            hv = get_single_kanji_hv(ch)
            if hv:
                hv_chars.append(hv)
    return ' '.join(hv_chars) if hv_chars else ""

# ---------------------------------------------------------
# 2. HELPERS
# ---------------------------------------------------------
def is_ja_char(c):
    return ('\u3040' <= c <= '\u30ff' or '\u4e00' <= c <= '\u9fff'
            or '\uff66' <= c <= '\uff9d')

def has_ja_text(s):
    return any(is_ja_char(c) for c in s)

def is_hira(s):
    s_clean = s.replace(' ', '').replace('・', '')
    return len(s_clean) > 0 and all('\u3040' <= c <= '\u309f' for c in s_clean)

def get_sentence_reading(sentence):
    if not sentence:
        return ""
    try:
        res = kks.convert(sentence)
        return ''.join([item['hira'] for item in res])
    except Exception:
        return ""

def clean_text(t):
    if not t:
        return ""
    t = t.replace('**', '').replace('\r', '').strip()
    t = re.sub(r' +', ' ', t)
    return t

def parse_examples_from_box(box_words):
    """Parse example sentences from a box of words."""
    if not box_words:
        return []

    lines = []
    for w in sorted(box_words, key=lambda k: (k[1], k[0])):
        x0, y0, x1, y1, text = w[0], w[1], w[2], w[3], w[4]
        if (y1 - y0) < 7.0:  # Skip furigana in examples
            continue
        found = False
        for line in lines:
            if abs(line['y'] - y0) < 4.0:
                line['words'].append((x0, x1, text))
                found = True
                break
        if not found:
            lines.append({'y': y0, 'words': [(x0, x1, text)]})

    line_strs = []
    for line in sorted(lines, key=lambda l: l['y']):
        words_in_line = sorted(line['words'], key=lambda w: w[0])
        res = ""
        prev_x1 = None
        for x0, x1, txt in words_in_line:
            if not res:
                res = txt
            elif is_ja_char(res[-1]) or is_ja_char(txt[0]):
                res += txt
            elif prev_x1 is not None and (x0 - prev_x1) > 1.5:
                res += ' ' + txt
            else:
                res += txt
            prev_x1 = x1
        res = clean_text(res)
        if res:
            line_strs.append(res)

    full_text = '\n'.join(line_strs)
    bullets = [b.strip() for b in full_text.split('・') if b.strip()]

    final_examples = []
    for b in bullets:
        lines_in_b = [l.strip() for l in b.split('\n') if l.strip()]
        ja_parts = []
        vi_parts = []
        for l in lines_in_b:
            if has_ja_text(l):
                ja_parts.append(l)
            else:
                vi_parts.append(l)

        ja_raw = clean_text(''.join(ja_parts))
        vi_raw = clean_text(' '.join(vi_parts))

        split_match = re.split(
            r'(?<=[。！？])\s*(?=[A-ZÀÁẢẠÃĂẰẮẲẶẴÂẦẤẨẬẪĐÈÉẺẸẼÊỀẾỂỆỄÌÍỈỊĨÒÓỎỌÕÔỒỐỔỘỖƠỜỚỞỢỠÙÚỦỤŨƯỪỨỬỰỮỲÝỶỴỸa-z])',
            ja_raw, maxsplit=1
        )
        if len(split_match) == 2:
            ja_text = split_match[0].strip()
            vi_text = split_match[1].strip() + (' ' + vi_raw if vi_raw else '')
        else:
            ja_text = ja_raw
            vi_text = vi_raw

        ja_text = clean_text(ja_text)
        vi_text = clean_text(vi_text)

        if ja_text:
            reading = get_sentence_reading(ja_text)
            final_examples.append({"ja": ja_text, "reading": reading, "vi": vi_text})

    return final_examples

# ---------------------------------------------------------
# 3. MAIN EXTRACTION ENGINE
# ---------------------------------------------------------
CHAPTER_WORD_TYPES = {
    "1": "Động từ", "2": "Động danh từ", "3": "Danh từ",
    "4": "Tính từ -i", "5": "Tính từ -na", "6": "Phó từ",
    "7": "Động từ", "8": "Danh từ", "9": "Danh từ",
    "10": "Từ vựng", "11": "Tiền tố / Hậu tố"
}
CHAPTER_NAMES = {
    "1": "Động từ", "2": "Động danh từ", "3": "Danh từ",
    "4": "Tính từ -i", "5": "Tính từ -na", "6": "Phó từ + Từ nối",
    "7": "複合動詞", "8": "カタカナ", "9": "まとめ",
    "10": "Phân biệt từ vựng", "11": "Tiền tố hậu tố"
}

def extract_vocab_from_pdf(pdf_path, output_dir):
    doc = fitz.open(pdf_path)
    print(f"Opened PDF: {pdf_path}, Total pages: {len(doc)}")
    os.makedirs(output_dir, exist_ok=True)

    current_chapter = "1"
    current_subsection = "1.1"
    sections = {}

    def ensure_section(ch, sub):
        key = sub
        if key not in sections:
            ch_name = CHAPTER_NAMES.get(ch, f"Chương {ch}")
            sections[key] = {
                "chapter": ch, "sub": sub,
                "lesson_name": f"N2 Chương {ch} - {ch_name} {sub}",
                "words": []
            }
        return sections[key]

    ensure_section("1", "1.1")

    # ---------------------------------------------------------
    # PART A: Pages 3-124 (Chapters 1-9: Grid Table Format)
    # ---------------------------------------------------------
    for page_idx in range(2, 124):
        page = doc[page_idx]
        words = page.get_text('words')

        # Detect chapter header
        top_words = [w for w in words if w[1] < 120]
        page_text = ' '.join([w[4] for w in sorted(top_words, key=lambda k: (k[1], k[0]))])
        ch_match = re.search(r'(\d{1,2})\s*章', page_text)
        if ch_match:
            current_chapter = ch_match.group(1)
        sub_match = re.search(r'(\d{1,2}\.\d{1,2})', page_text)
        if sub_match:
            current_subsection = sub_match.group(1)

        target_sec = ensure_section(current_chapter, current_subsection)
        word_type = CHAPTER_WORD_TYPES.get(current_chapter, "Từ vựng")

        # Find pure integer ID items
        id_items = []
        for w in words:
            if 40 <= w[0] <= 95 and 90 <= w[1] <= 780:
                txt = w[4].strip()
                if txt.isdigit(): # Pure integer ID check
                    id_items.append((int(txt), w[1], w[3]))

        id_items.sort(key=lambda x: x[1])
        unique_ids = []
        for item in id_items:
            if not unique_ids or abs(item[1] - unique_ids[-1][1]) > 10:
                unique_ids.append(item)

        for i, (item_id, id_y0, id_y1) in enumerate(unique_ids):
            top_b = 50 if i == 0 else (unique_ids[i-1][1] + id_y0) / 2
            bot_b = 780 if i + 1 == len(unique_ids) else (id_y0 + unique_ids[i+1][1]) / 2

            row_words = [w for w in words if top_b <= w[1] < bot_b]

            # Word & reading items
            col_w_items = [w for w in row_words if 90 <= w[0] < 145]
            col_r_items = [w for w in row_words if 145 <= w[0] < 192]

            # If no kanji column (e.g. adverbs in Ch 6), col_w_items will be hiragana at 90-192
            if not col_w_items and col_r_items:
                col_w_items = col_r_items
                col_r_items = []
            elif not col_w_items:
                col_w_items = [w for w in row_words if 90 <= w[0] < 192]

            # Meaning items: 192 <= x0 < 275 AND NOT Japanese AND NOT starting with '・'
            col_m_items = []
            ex_extra_words = []
            for w in row_words:
                if 192 <= w[0] < 275:
                    txt = w[4].strip()
                    if txt.startswith('・') or has_ja_text(txt):
                        ex_extra_words.append(w)
                    else:
                        col_m_items.append(w)

            # Build strings
            def join_w_words(w_list):
                lines = []
                for w in sorted(w_list, key=lambda k: (round(k[1]/4)*4, k[0])):
                    found = False
                    for line in lines:
                        if abs(line['y'] - w[1]) < 4.0:
                            line['words'].append(w)
                            found = True
                            break
                    if not found:
                        lines.append({'y': w[1], 'words': [w]})
                lines.sort(key=lambda l: l['y'])
                res_lines = []
                for line in lines:
                    words_in_line = sorted(line['words'], key=lambda w: w[0])
                    res_lines.append(''.join([w[4] for w in words_in_line]))
                return ' '.join(res_lines)

            word_str = clean_text(join_w_words(col_w_items))
            reading_str = clean_text(join_w_words(col_r_items))
            if not reading_str:
                reading_str = get_sentence_reading(word_str) if word_str else ""

            # Meaning string
            m_lines = []
            for w in sorted(col_m_items, key=lambda k: (round(k[1]/4)*4, k[0])):
                found = False
                for line in m_lines:
                    if abs(line['y'] - w[1]) < 4.0:
                        line['words'].append(w)
                        found = True
                        break
                if not found:
                    m_lines.append({'y': w[1], 'words': [w]})
            m_lines.sort(key=lambda l: l['y'])
            meaning_parts = [' '.join([w[4] for w in sorted(l['words'], key=lambda k: k[0])]) for l in m_lines]
            meaning_str = clean_text(' ; '.join(p for p in meaning_parts if p.strip()))

            if meaning_str.startswith('- '):
                meaning_str = meaning_str[2:]

            # Examples box
            ex_box = [w for w in row_words if w[0] >= 275] + ex_extra_words
            examples = parse_examples_from_box(ex_box)
            han_viet = get_han_viet(word_str)

            if not word_str and not reading_str:
                continue

            target_sec["words"].append({
                "word": word_str if word_str else reading_str,
                "reading": reading_str if reading_str else word_str,
                "han_viet": han_viet,
                "word_type": word_type,
                "meaning": meaning_str,
                "examples": examples
            })

    # ---------------------------------------------------------
    # PART B: Pages 125-146 (Chapters 10 & 11: Text / Distinction Format)
    # ---------------------------------------------------------
    for page_idx in range(124, len(doc)):
        page = doc[page_idx]
        words = page.get_text('words')

        # Detect chapter header
        top_words = [w for w in words if w[1] < 120]
        page_text = ' '.join([w[4] for w in sorted(top_words, key=lambda k: (k[1], k[0]))])
        ch_match = re.search(r'(\d{1,2})\s*章', page_text)
        if ch_match:
            current_chapter = ch_match.group(1)
        sub_match = re.search(r'(\d{1,2}\.\d{1,2})', page_text)
        if sub_match:
            current_subsection = sub_match.group(1)

        target_sec = ensure_section(current_chapter, current_subsection)
        word_type = CHAPTER_WORD_TYPES.get(current_chapter, "Từ vựng")

        # Left column words: x0 < 130 (or x0 < 180 for Ch 11)
        max_col1_x = 180 if current_chapter == "11" else 130
        col1 = [w for w in words if w[0] < max_col1_x and 90 <= w[1] <= 780]
        lines = []
        for w in sorted(col1, key=lambda k: (round(k[1]/4)*4, k[0])):
            found = False
            for line in lines:
                if abs(line['y'] - w[1]) < 4.0:
                    line['words'].append(w)
                    found = True
                    break
            if not found:
                lines.append({'y': w[1], 'words': [w]})
        lines.sort(key=lambda l: l['y'])

        entries = []
        i = 0
        while i < len(lines):
            txt = ' '.join([w[4] for w in sorted(lines[i]['words'], key=lambda k: k[0])]).strip()
            if (not txt or not has_ja_text(txt) or txt.startswith('・')
                    or '章' in txt or 'HẬU' in txt or 'TỪ' in txt or 'VÍ' in txt
                    or len(txt) == 1 and not ('\u4e00' <= txt <= '\u9fff')):
                i += 1
                continue

            if i + 1 < len(lines):
                next_txt = ' '.join([w[4] for w in sorted(lines[i+1]['words'], key=lambda k: k[0])]).strip()
                y_diff = lines[i+1]['y'] - lines[i]['y']
                if is_hira(txt) and any('\u4e00' <= c <= '\u9fff' for c in next_txt) and y_diff < 15.0:
                    entries.append({'word': next_txt, 'reading': txt, 'y': lines[i+1]['y']})
                    i += 2
                    continue

            entries.append({'word': txt, 'reading': txt if is_hira(txt) else get_sentence_reading(txt), 'y': lines[i]['y']})
            i += 1

        for idx, e in enumerate(entries):
            y_curr = e['y']
            top_b = 90 if idx == 0 else (entries[idx-1]['y'] + y_curr) / 2
            bot_b = 780 if idx + 1 == len(entries) else (y_curr + entries[idx+1]['y']) / 2

            row_words = [w for w in words if top_b <= w[1] < bot_b]

            # Meaning words: 130 <= x0 < 270, abs(w[1] - y_curr) < 25.0
            m_words = [w for w in row_words if 130 <= w[0] < 270 and abs(w[1] - y_curr) < 25.0 and not w[4].startswith('・') and not has_ja_text(w[4])]
            m_lines = []
            for w in sorted(m_words, key=lambda k: (round(k[1]/4)*4, k[0])):
                found = False
                for line in m_lines:
                    if abs(line['y'] - w[1]) < 4.0:
                        line['words'].append(w)
                        found = True
                        break
                if not found:
                    m_lines.append({'y': w[1], 'words': [w]})
            m_lines.sort(key=lambda l: l['y'])
            m_parts = [' '.join([w[4] for w in sorted(l['words'], key=lambda k: k[0])]) for l in m_lines]
            meaning_str = clean_text(' '.join(m_parts))

            # Examples box: x0 >= 230 or starting with '・' or has Japanese text
            ex_box = [w for w in row_words if w[0] >= 220 or w[4].startswith('・') or has_ja_text(w[4])]
            # Exclude left column word items from ex_box
            ex_box_clean = [w for w in ex_box if w[0] >= 220]
            examples = parse_examples_from_box(ex_box_clean)

            word_str = e['word']
            reading_str = e['reading'] if e['reading'] else get_sentence_reading(word_str)
            han_viet = get_han_viet(word_str)

            if not word_str:
                continue

            target_sec["words"].append({
                "word": word_str,
                "reading": reading_str,
                "han_viet": han_viet,
                "word_type": word_type,
                "meaning": meaning_str,
                "examples": examples
            })

    # Write JSON files (skip lesson_1 which is manually verified)
    print("\nWriting JSON files...")

    def sort_key(s):
        parts = s.split('.')
        return (int(parts[0]), int(parts[1]) if len(parts) > 1 else 0)

    sorted_subsections = sorted(sections.keys(), key=sort_key)
    lesson_count = 0
    for idx, sub in enumerate(sorted_subsections, start=1):
        sec_data = sections[sub]
        if not sec_data["words"]:
            continue
        lesson_count += 1
        lesson_id = f"lesson_{lesson_count:02d}"
        file_name = f"lesson_{lesson_count}.json"
        file_path = os.path.join(output_dir, file_name)

        if lesson_count == 1:
            print(f"SKIP {file_name}: kept manually verified version")
            continue

        formatted_words = []
        for w_idx, w in enumerate(sec_data["words"], start=1):
            formatted_words.append({
                "id": w_idx,
                "word": w["word"],
                "reading": w["reading"],
                "han_viet": w["han_viet"],
                "word_type": w["word_type"],
                "meaning": w["meaning"],
                "examples": w["examples"]
            })

        output_json = {
            "lesson_id": lesson_id,
            "lesson_name": sec_data["lesson_name"],
            "level": "N2",
            "words": formatted_words
        }

        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(output_json, f, ensure_ascii=False, indent=2)

        print(f"Generated {file_name}: {sec_data['lesson_name']} ({len(formatted_words)} words)")

    print(f"\nDone: {lesson_count} lessons processed.")

if __name__ == '__main__':
    pdf_file = os.path.join(
        'FILE SÁCH KANJI - TV - NP N2 (PDF)',
        'PDF TỪ VỰNG N2',
        'N2 - từ vựng 201223.pdf'
    )
    out_dir = os.path.join('src', 'data')
    extract_vocab_from_pdf(pdf_file, out_dir)
