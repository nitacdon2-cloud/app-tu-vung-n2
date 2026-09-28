import pymupdf as fitz
import os
import re
import json
import io
import sys
import urllib.request
import zipfile
import pykakasi

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

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
    '被': 'BỊ', '酔': 'TUÝ', '収': 'THU', '益': 'ÍCH', '利': 'LỢI',
    '期': 'KỲ', '予': 'DỰ', '算': 'TOÁN', '範': 'PHẠM', '囲': 'VI',
    '創': 'SÁNG', '造': 'TẠO', '性': 'TÍNH', '植': 'THỰC', '物': 'VẬT',
    '製': 'CHẾ', '税': 'THUẾ', '金': 'KIM', '年': 'NIÊN', '奨': 'THƯỞNG',
    '学': 'HỌC', '保': 'BẢO', '証': 'CHỨNG', '授': 'THỤ', '業': 'NGHIỆP',
    '料': 'LIỆU', '場': 'TRƯỜNG', '険': 'HIỂM', '使': 'SỬ', '用': 'DỤNG',
    '電': 'ĐIỆN', '気': 'KHÍ', '代': 'ĐẠI', '修': 'TU', '理': 'LÝ',
    '飲': 'ẨM', '運': 'VẬN', '賃': 'NHẪM', '乗': 'THỪA', '車': 'XA',
    '家': 'GIA', '借': 'TÁ', '手': 'THỦ', '間': 'GIAN'
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
    except Exception:
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

HEADER_BLACK_LIST = {
    '言葉', '読み方', '意味', '例文', '番号', '章', 'HẬU', 'TỐ', 'TỪ', 'VỰNG', 'VÍ', 'DỤ',
    '動詞', '名詞', '形容詞', '副詞', '接続詞', '複合動詞', 'カタカナ', 'TIỀN TỐ'
}

def is_ja_char(c):
    return ('\u3040' <= c <= '\u30ff' or '\u4e00' <= c <= '\u9fff' or '\uff66' <= c <= '\uff9d')

def has_ja_text(s):
    return any(is_ja_char(c) for c in s)

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

def split_ja_vi(text):
    ja_parts = []
    vi_parts = []
    for ch in text:
        if is_ja_char(ch) or ch in "・〜-()（）①②③④⑤":
            ja_parts.append(ch)
        else:
            vi_parts.append(ch)
    return clean_text("".join(ja_parts)), clean_text("".join(vi_parts))

def parse_examples_from_box(box_words):
    if not box_words:
        return []

    lines = []
    for w in sorted(box_words, key=lambda k: (k[1], k[0])):
        x0, y0, x1, y1, text = w[0], w[1], w[2], w[3], w[4]
        if (y1 - y0) < 7.5:  # Skip furigana in examples
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
# 2. EXTRACTION LOGIC
# ---------------------------------------------------------
CHAPTER_WORD_TYPES = {
    "1": "Động từ", "2": "Động danh từ", "3": "Danh từ",
    "4": "Tính từ -i", "5": "Tính từ -na", "6": "Phó từ + Từ nối",
    "7": "Động từ ghép", "8": "Katakana", "9": "Tổng hợp",
    "10": "Phân biệt từ vựng", "11": "Tiền tố / Hậu tố"
}

def extract_all_pdf_vocab(pdf_path):
    doc = fitz.open(pdf_path)
    print(f"Opened PDF: {pdf_path} ({len(doc)} pages)")
    
    extracted_words = []
    current_ch = "1"
    
    # ---------------------------------------------------------
    # PART A: Chapters 1 to 9 (Pages 3-124)
    # ---------------------------------------------------------
    for page_idx in range(2, 124):
        page = doc[page_idx]
        words = page.get_text('words')
        main_words = [w for w in words if (w[3] - w[1]) >= 7.5]
        
        top_words = [w for w in main_words if w[1] < 120]
        top_text = ' '.join([w[4] for w in sorted(top_words, key=lambda k: (k[1], k[0]))])
        ch_match = re.search(r'(\d{1,2})\s*章', top_text)
        if ch_match:
            current_ch = ch_match.group(1)
            
        word_type = CHAPTER_WORD_TYPES.get(current_ch, "Từ vựng")
        
        id_items = []
        for w in main_words:
            if 30 <= w[0] <= 100 and 60 <= w[1] <= 800:
                txt = w[4].strip()
                if txt.isdigit():
                    id_items.append((int(txt), w[1], w[3]))
                    
        id_items.sort(key=lambda x: x[1])
        unique_ids = []
        for item in id_items:
            if not unique_ids or abs(item[1] - unique_ids[-1][1]) > 10:
                unique_ids.append(item)
                
        clean_words = [w for w in main_words if w[4].strip() not in HEADER_BLACK_LIST]
        
        for i, (item_id, id_y0, id_y1) in enumerate(unique_ids):
            top_b = id_y0 - 20 if i == 0 else (unique_ids[i-1][1] + id_y0) / 2
            bot_b = 780 if i + 1 == len(unique_ids) else (id_y0 + unique_ids[i+1][1]) / 2
            
            row_words = [w for w in clean_words if top_b <= w[1] < bot_b]
            
            if current_ch == "8" or page_idx >= 115:
                col_w_items = [w for w in row_words if 80 <= w[0] < 130 and has_ja_text(w[4])]
                col_r_items = []
            else:
                col_w_items = [w for w in row_words if 85 <= w[0] < 130]
                col_r_items = [w for w in row_words if 130 <= w[0] < 192]
                
                if not col_w_items and col_r_items:
                    col_w_items = col_r_items
                    col_r_items = []
                elif not col_w_items:
                    col_w_items = [w for w in row_words if 85 <= w[0] < 192]

            col_m_items = []
            ex_extra_words = []
            for w in row_words:
                if 192 <= w[0] < 275:
                    txt = w[4].strip()
                    if txt.startswith('・') or has_ja_text(txt):
                        ex_extra_words.append(w)
                    else:
                        col_m_items.append(w)

            def join_w_words(w_list):
                if not w_list:
                    return ""
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
                return ''.join(res_lines)

            word_str = clean_text(join_w_words(col_w_items))
            reading_str = clean_text(join_w_words(col_r_items))
            if not reading_str and word_str:
                reading_str = get_sentence_reading(word_str)

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
            
            m_parts = []
            for l in m_lines:
                words_in_line = sorted(l['words'], key=lambda w: w[0])
                m_parts.append(' '.join([w[4] for w in words_in_line]))
            meaning_str = clean_text(' '.join(m_parts))

            ex_box = [w for w in row_words if w[0] >= 275] + ex_extra_words
            examples = parse_examples_from_box(ex_box)

            if word_str:
                extracted_words.append({
                    "raw_id": item_id,
                    "word": word_str,
                    "reading": reading_str,
                    "han_viet": get_han_viet(word_str),
                    "word_type": word_type,
                    "meaning": meaning_str,
                    "examples": examples
                })

    print(f"Extracted {len(extracted_words)} words from Chapters 1 to 9.")

    # ---------------------------------------------------------
    # PART B: Chapter 10 (Pages 125-133: Vocabulary Distinctions)
    # ---------------------------------------------------------
    ch10_words = []
    for page_idx in range(124, 133):
        page = doc[page_idx]
        p_words = page.get_text('words')
        main_pwords = [w for w in p_words if (w[3] - w[1]) >= 7.5]
        
        line_dict = {}
        for w in main_pwords:
            y_round = round(w[1] / 6) * 6
            if y_round not in line_dict:
                line_dict[y_round] = []
            line_dict[y_round].append(w)
            
        sorted_y = sorted(line_dict.keys())
        
        curr_w = None
        curr_r = ""
        curr_m = []
        curr_ex = []
        
        for y in sorted_y:
            lw = sorted(line_dict[y], key=lambda k: k[0])
            ltxt = clean_text(''.join([w[4] for w in lw]))
            
            if not ltxt or ltxt in HEADER_BLACK_LIST or '10 章' in ltxt or re.match(r'10\.\d+', ltxt):
                continue
                
            if not has_ja_text(ltxt):
                if curr_m:
                    curr_m.append(ltxt)
                elif curr_ex:
                    curr_ex.append(ltxt)
            else:
                if '・' in ltxt:
                    curr_ex.append(ltxt)
                elif any(c in ltxt for c in ['①', '②', '③', '④', 'Ý nghĩa', 'Ý nghĩa']):
                    curr_m.append(ltxt)
                elif len(ltxt) <= 20 and not any(c in ltxt for c in ['。', '、', '？']):
                    ja_head, vi_extra = split_ja_vi(ltxt)
                    if ja_head and ja_head not in HEADER_BLACK_LIST and not re.match(r'^\d+\s*章$', ja_head):
                        if curr_w and (curr_m or curr_ex):
                            ch10_words.append({
                                "word": curr_w,
                                "reading": curr_r or get_sentence_reading(curr_w),
                                "han_viet": get_han_viet(curr_w),
                                "word_type": "Phân biệt từ vựng",
                                "meaning": clean_text(' '.join(curr_m)),
                                "examples": parse_examples_from_box([(0, 0, 100, 20, e) for e in curr_ex])
                            })
                            curr_m = []
                            curr_ex = []
                        curr_w = ja_head
                        curr_r = get_sentence_reading(ja_head)
                        if vi_extra:
                            curr_m.append(vi_extra)
                else:
                    if curr_m:
                        curr_m.append(ltxt)

        if curr_w and (curr_m or curr_ex):
            ch10_words.append({
                "word": curr_w,
                "reading": curr_r or get_sentence_reading(curr_w),
                "han_viet": get_han_viet(curr_w),
                "word_type": "Phân biệt từ vựng",
                "meaning": clean_text(' '.join(curr_m)),
                "examples": parse_examples_from_box([(0, 0, 100, 20, e) for e in curr_ex])
            })

    print(f"Extracted {len(ch10_words)} words from Chapter 10.")
    extracted_words.extend(ch10_words)

    # ---------------------------------------------------------
    # PART C: Chapter 11 (Pages 134-146: Prefixes & Suffixes)
    # ---------------------------------------------------------
    ch11_words = []
    for page_idx in range(133, 146):
        page = doc[page_idx]
        p_words = page.get_text('words')
        main_pwords = [w for w in p_words if (w[3] - w[1]) >= 7.5]
        
        line_dict = {}
        for w in main_pwords:
            y_round = round(w[1] / 6) * 6
            if y_round not in line_dict:
                line_dict[y_round] = []
            line_dict[y_round].append(w)
            
        sorted_y = sorted(line_dict.keys())
        
        for y in sorted_y:
            lw = sorted(line_dict[y], key=lambda k: k[0])
            ltxt = clean_text(''.join([w[4] for w in lw]))
            
            if not ltxt or any(bad in ltxt for bad in ['11 章', 'TIỀN TỐ', 'HẬU TỐ', 'TỪ VỰNG', 'VÍ DỤ']) or re.match(r'11\.\d+', ltxt):
                continue
                
            if has_ja_text(ltxt) and len(ltxt) <= 20 and not ltxt.startswith('・'):
                ja_w, vi_m = split_ja_vi(ltxt)
                if ja_w and ja_w not in HEADER_BLACK_LIST and not re.match(r'^\d+\s*章$', ja_w):
                    r_str = get_sentence_reading(ja_w)
                    hv_str = get_han_viet(ja_w)
                    
                    ch11_words.append({
                        "word": ja_w,
                        "reading": r_str,
                        "han_viet": hv_str,
                        "word_type": "Tiền tố / Hậu tố",
                        "meaning": vi_m or "Tiền tố / Hậu tố N2",
                        "examples": []
                    })

    print(f"Extracted {len(ch11_words)} words from Chapter 11.")
    extracted_words.extend(ch11_words)

    print(f"\nGRAND TOTAL VOCABULARY EXTRACTED FROM PDF: {len(extracted_words)} words!")
    return extracted_words
