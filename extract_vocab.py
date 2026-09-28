import os
import re
import json
import io
import sys
import urllib.request
import zipfile
import fitz  # PyMuPDF
import pykakasi

# Configure UTF-8 stdout/stderr for Windows console compatibility
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# Initialize pykakasi for example sentence hiragana readings
kks = pykakasi.kakasi()

# ---------------------------------------------------------
# 1. HÁN-VIỆT DICTIONARY SETUP
# ---------------------------------------------------------

PREFERRED_HV = {
    '引': 'DẪN', '打': 'ĐẢ', '計': 'KẾ', '量': 'LƯỢNG', '齧': 'NIẾT',
    '静': 'TĨNH', '躓': 'CHÍ', '頷': 'HÀM', '吐': 'THỔ', '傷': 'THƯƠNG',
    '見': 'KIẾN', '舞': 'VŨ', '転': 'CHUYỂN', '配': 'PHỐI', '放': 'PHÓNG',
    '床': 'SÀN', '切': 'THIẾT', '重': 'TRỌNG', '空': 'KHÔNG', '行': 'HÀNH',
    '生': 'SINH', '相': 'TƯƠNG', '場': 'TRƯỜNG', '分': 'PHÂN', '長': 'TRƯỜNG',
    '悪': 'ÁC', '強': 'CƯỜNG', '正': 'CHÍNH', '好': 'HẢO', '大': 'ĐẠI',
    '小': 'TIỂU', '高': 'CAO', '安': 'AN', '新': 'TÂN', '古': 'CỔ',
    '測': 'TRẮC', '鎮': 'TRẤN', '凹': 'AO', '凸': 'ĐỘT', '込': 'NHẬP'
}

def load_han_viet_dict():
    print("Loading Hán-Việt dictionary database...")
    dict_map = {}

    # Load Unihan
    try:
        url_u = 'https://www.unicode.org/Public/UNIDATA/Unihan.zip'
        with urllib.request.urlopen(url_u) as resp:
            z = zipfile.ZipFile(io.BytesIO(resp.read()))
            readings = z.read('Unihan_Readings.txt').decode('utf-8')
            for line in readings.splitlines():
                if 'kVietnamese' in line:
                    parts = line.split('\t')
                    if len(parts) >= 3:
                        cp = int(parts[0].replace('U+', ''), 16)
                        dict_map[chr(cp)] = [parts[2].strip().upper()]
    except Exception as e:
        print(f"Warning: Could not fetch Unihan ({e})")

    # Load KanjiDictVN for 100% coverage
    try:
        url_k = 'https://github.com/trungnt2910/KanjiDictVN/releases/download/trungnt2910.hannom.20251225-154650.kanjidic2.2025-345/KANJIDIC_vietnamese.zip'
        req = urllib.request.Request(url_k, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp:
            z = zipfile.ZipFile(io.BytesIO(resp.read()))
            for filename in ['kanji_bank_1.json', 'kanji_bank_2.json']:
                if filename in z.namelist():
                    kb = json.loads(z.read(filename).decode('utf-8'))
                    for entry in kb:
                        char = entry[0]
                        readings = [r.upper() for r in entry[1].strip().split()]
                        if char not in dict_map:
                            dict_map[char] = readings
                        else:
                            for r in readings:
                                if r not in dict_map[char]:
                                    dict_map[char].append(r)
    except Exception as e:
        print(f"Warning: Could not fetch KanjiDictVN ({e})")

    return dict_map

HV_DICT = load_han_viet_dict()

def get_single_kanji_hv(c):
    if c in PREFERRED_HV:
        return PREFERRED_HV[c]
    if c in HV_DICT:
        readings = HV_DICT[c]
        for r in readings:
            if r in ['DẪN', 'ĐẢ', 'KẾ', 'LƯỢNG', 'TĨNH', 'CHÍ', 'KÍCH', 'TRẮC', 'THỔ', 'CƠ', 'ĐỊA', 'HỘI', 'AO', 'NIẾT', 'HÀM', 'TRẤN']:
                return r
        return readings[0]
    return ''

def get_han_viet(word_str):
    if not word_str:
        return ""
    parts = [p.strip() for p in word_str.split('/')]
    res_parts = []
    for part in parts:
        hv_chars = []
        for ch in part:
            if '\u4e00' <= ch <= '\u9fff' or '\u3400' <= ch <= '\u4dbf':
                hv = get_single_kanji_hv(ch)
                if hv:
                    hv_chars.append(hv)
        if hv_chars:
            res_parts.append(' '.join(hv_chars))
    return ' / '.join(res_parts) if res_parts else ""


# ---------------------------------------------------------
# 2. HELPER FUNCTIONS FOR CLEANING AND EXAMPLE PARSING
# ---------------------------------------------------------

def is_ja_char(c):
    return '\u3040' <= c <= '\u30ff' or '\u4e00' <= c <= '\u9fff' or '\uff66' <= c <= '\uff9d' or c in '・。、「」『』（）'

def get_sentence_reading(sentence):
    if not sentence:
        return ""
    try:
        res = kks.convert(sentence)
        hira = ''.join([item['hira'] for item in res])
        return hira
    except Exception:
        return ""

def clean_text(t):
    if not t:
        return ""
    t = t.replace('**', '').replace('\r', '').strip()
    t = re.sub(r' +', ' ', t)
    return t

def join_words_by_distance(word_items):
    if not word_items:
        return ""
    lines = []
    for w in sorted(word_items, key=lambda k: (k[1], k[0])):
        x0, y0, x1, y1, text = w[0], w[1], w[2], w[3], w[4]
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
    return '\n'.join(line_strs)

def parse_examples_from_words(words_in_box):
    ex_words = [w for w in words_in_box if w[0] >= 280]
    if not ex_words:
        return []

    lines = []
    for w in sorted(ex_words, key=lambda k: (k[1], k[0])):
        x0, y0, x1, y1, text = w[0], w[1], w[2], w[3], w[4]
        height = y1 - y0
        if height < 7.0:  # Skip small furigana text lines
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
            if any('\u3040' <= c <= '\u30ff' or '\u4e00' <= c <= '\u9fff' for c in l):
                ja_parts.append(l)
            else:
                vi_parts.append(l)

        ja_raw = clean_text(''.join(ja_parts))
        vi_raw = clean_text(' '.join(vi_parts))

        # Check for inline Vietnamese after punctuation in Japanese string
        split_match = re.split(r'(?<=[。！？])\s*(?=[A-ZÀÁẢẠÃĂẰẮẲẶẴÂẦẤẨẬẪĐÈÉẺẸẼÊỀẾỂỆỄÌÍỈỊĨÒÓỎỌÕÔỒỐỔỘỖƠỜỚỞỢỠÙÚỦỤŨƯỪỨỬỰỮỲÝỶỴỸa-zàáảạãăằắẳặẵâầấẩậẫđèéẻẹẽêềếểệễìíỉịĩòóỏọõôồốổộỗơờớởợỡùúủụũưừứửựữỳýỷỵỹ])', ja_raw, maxsplit=1)
        if len(split_match) == 2:
            ja_text = split_match[0].strip()
            vi_text = split_match[1].strip() + (" " + vi_raw if vi_raw else "")
        else:
            ja_text = ja_raw
            vi_text = vi_raw

        ja_text = clean_text(ja_text)
        vi_text = clean_text(vi_text)

        if ja_text:
            reading = get_sentence_reading(ja_text)
            final_examples.append({
                "ja": ja_text,
                "reading": reading,
                "vi": vi_text
            })

    return final_examples


# ---------------------------------------------------------
# 3. MAIN EXTRACTION LOGIC
# ---------------------------------------------------------

CHAPTER_WORD_TYPES = {
    "1": "Động từ",
    "2": "Động danh từ",
    "3": "Danh từ",
    "4": "Tính từ -i",
    "5": "Tính từ -na",
    "6": "Phó từ",
    "7": "Động từ",
    "8": "Danh từ",
    "9": "Danh từ",
    "10": "Từ vựng",
    "11": "Tiền tố / Hậu tố"
}

CHAPTER_NAMES = {
    "1": "Động từ",
    "2": "Động danh từ",
    "3": "Danh từ",
    "4": "Tính từ -i",
    "5": "Tính từ -na",
    "6": "Phó từ + Từ nối",
    "7": "複合動詞",
    "8": "カタカナ",
    "9": "まとめ",
    "10": "Phân biệt từ vựng",
    "11": "Tiền tố hậu tố"
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
                "chapter": ch,
                "sub": sub,
                "lesson_name": f"N2 Chương {ch} - {ch_name} {sub}",
                "words": []
            }
        return sections[key]

    ensure_section("1", "1.1")

    # Process Pages 3 to 124 (Chapters 1-9 Grid tables)
    for page_idx in range(2, 124):
        page = doc[page_idx]
        words = page.get_text('words')

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

        id_items = []
        for w in words:
            if 40 <= w[0] <= 95 and 50 <= w[1] <= 770:
                text = w[4].strip()
                if text.isdigit():
                    id_items.append((int(text), w[1], w[3]))

        id_items.sort(key=lambda x: x[1])
        unique_ids = []
        for item in id_items:
            if not unique_ids or abs(item[1] - unique_ids[-1][1]) > 10:
                unique_ids.append(item)

        for i, (item_id, y0, y1) in enumerate(unique_ids):
            slice_top = 115 if i == 0 else y0 - 8
            if i + 1 < len(unique_ids):
                slice_bottom = unique_ids[i+1][1] - 8
            else:
                slice_bottom = 770

            box_words = [w for w in words if slice_top <= w[1] < slice_bottom]

            col_word_items = [w for w in box_words if 90 <= w[0] < 145]
            col_reading_items = [w for w in box_words if 145 <= w[0] < 190]
            col_meaning_items = [w for w in box_words if 190 <= w[0] < 285]

            word_str = join_words_by_distance(col_word_items).replace('\n', ' ')
            reading_str = join_words_by_distance(col_reading_items).replace('\n', ' ')
            meaning_str = join_words_by_distance(col_meaning_items).replace('\n', ' ; ')
            if meaning_str.startswith('- '):
                meaning_str = meaning_str[2:]

            examples = parse_examples_from_words(box_words)
            han_viet = get_han_viet(word_str)

            word_entry = {
                "word": word_str if word_str else reading_str,
                "reading": reading_str if reading_str else word_str,
                "han_viet": han_viet,
                "word_type": word_type,
                "meaning": meaning_str,
                "examples": examples
            }

            target_sec["words"].append(word_entry)

    # Process Chapters 10 and 11 (Pages 125 to 146)
    for page_idx in range(124, len(doc)):
        page = doc[page_idx]
        text = page.get_text()
        lines = [l.strip() for l in text.split('\n') if l.strip()]

        page_top = ' '.join(lines[:5])
        ch_match = re.search(r'(\d{1,2})\s*章', page_top)
        if ch_match:
            current_chapter = ch_match.group(1)

        sub_match = re.search(r'(\d{1,2}\.\d{1,2})', page_top)
        if sub_match:
            current_subsection = sub_match.group(1)

        target_sec = ensure_section(current_chapter, current_subsection)
        word_type = CHAPTER_WORD_TYPES.get(current_chapter, "Từ vựng")

        i = 0
        while i < len(lines):
            line = lines[i]
            if any('\u3040' <= c <= '\u30ff' or '\u4e00' <= c <= '\u9fff' for c in line) and not line.startswith('・') and '章' not in line:
                word_str = clean_text(line)
                meaning_str = ""
                examples = []
                
                j = i + 1
                while j < min(i + 8, len(lines)):
                    next_line = lines[j]
                    if next_line.startswith('・'):
                        ja_ex = clean_text(next_line[1:])
                        vi_ex = ""
                        if j + 1 < len(lines) and not lines[j+1].startswith('・') and not any('\u3040' <= c <= '\u30ff' or '\u4e00' <= c <= '\u9fff' for c in lines[j+1]):
                            vi_ex = clean_text(lines[j+1])
                            j += 1
                        examples.append({
                            "ja": ja_ex,
                            "reading": get_sentence_reading(ja_ex),
                            "vi": vi_ex
                        })
                    elif not meaning_str and not any('\u3040' <= c <= '\u30ff' or '\u4e00' <= c <= '\u9fff' for c in next_line):
                        meaning_str = clean_text(next_line)
                    j += 1
                
                han_viet = get_han_viet(word_str)
                reading_str = get_sentence_reading(word_str)

                word_entry = {
                    "word": word_str,
                    "reading": reading_str,
                    "han_viet": han_viet,
                    "word_type": word_type,
                    "meaning": meaning_str,
                    "examples": examples
                }
                target_sec["words"].append(word_entry)
                i = j - 1
            i += 1

    # Write JSON files to output_dir
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

    print(f"\nSuccessfully generated {lesson_count} lesson files in '{output_dir}'.")

if __name__ == '__main__':
    pdf_file = os.path.join(
        'FILE SÁCH KANJI - TV - NP N2 (PDF)',
        'PDF TỪ VỰNG N2',
        'N2 - từ vựng 201223.pdf'
    )
    out_dir = os.path.join('src', 'data')
    extract_vocab_from_pdf(pdf_file, out_dir)
