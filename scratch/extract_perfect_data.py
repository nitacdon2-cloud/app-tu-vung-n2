import pymupdf as fitz
import os, sys, re, json, glob, pykakasi

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

kks = pykakasi.kakasi()

pdf_path = os.path.join(
    'FILE SÁCH KANJI - TV - NP N2 (PDF)',
    'PDF TỪ VỰNG N2',
    'N2 - từ vựng 201223.pdf'
)

# ---------------------------------------------------------
# 1. HAN-VIET DICTIONARY & HELPERS
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
    '製': 'CHẾ', '税': 'THUẾ', '金': 'KIM', '年': 'NIÊN', '奨': 'THƯẢNG',
    '学': 'HỌC', '保': 'BẢO', '証': 'CHỨNG', '授': 'THỤ', '業': 'NGHIỆP',
    '料': 'LIỆU', '場': 'TRƯỜNG', '険': 'HIỂM', '使': 'SỬ', '用': 'DỤNG',
    '電': 'ĐIỆN', '気': 'KHÍ', '代': 'ĐẠI', '修': 'TU', '理': 'LÝ',
    '飲': 'ẨM', '運': 'VẬN', '賃': 'NHẪM', '乗': 'THỪA', '車': 'XA',
    '家': 'GIA', '借': 'TÁ', '手': 'THỦ', '間': 'GIAN', '不': 'BẤT',
    '無': 'VÔ', '非': 'PHI', '未': 'VỊ', '超': 'SIÊU', '各': 'CÁC',
    '副': 'PHÓ', '名': 'DANH', '全': 'TOÀN', '総': 'TỔNG', '現': 'HIỆN',
    '前': 'TIỀN', '元': 'NGUYÊN', '故': 'CỐ', '内': 'NỘI', '外': 'NGOẠI',
    '化': 'HÓA', '目': 'MỤC', '当': 'ĐƯƠNG', '的': 'ĐÍCH', '風': 'PHONG',
    '感': 'CẢM', '犯': 'PHẠM', '侵': 'XÂM', '冒': 'MẠO', '及': 'CẬP',
    '展': 'TRIỂN', '達': 'ĐẠT', '容': 'DUNG', '中': 'TRUNG', '身': 'THÂN',
    '値': 'TRỊ', '段': 'ĐOẠN', '価': 'GIÁ', '格': 'CÁCH', '楽': 'LẠC',
    '過': 'QUÁ', '度': 'ĐỘ', '違': 'VI', '合': 'HỢP', '問': 'VẤN',
    '題': 'ĐỀ', '答': 'ĐÁP', '解': 'GIẢI', '説': 'THUYẾT', '文': 'VĂN',
    '字': 'TỰ', '語': 'NGỮ', '言': 'NGÔN', '話': 'THOẠI', '書': 'THƯ',
    '読': 'ĐỌC', '聞': 'VĂN', '食': 'THỰC', '買': 'MÃI', '売': 'MẠI'
}

VI_LEAD_WORDS = (
    'Không', 'Chưa', 'Đổ', 'Gieo', 'Cởi', 'Tuột', 'Sắc', 'Vụ', 'Người', 'Tác',
    'Phụ', 'Bộ', 'Cựu', 'Cố', 'Thánh', 'Di', 'Phận', 'Lao', 'Bài', 'Mức',
    'Thời', 'Mang', 'Tính', 'Kiểu', 'Trông', 'Nêm', 'Cảm', 'Phí', 'Tiền', 'Thứ',
    'Một', 'Cái', 'Dầu', 'Tự', 'Hãy', 'Vui', 'Sự', 'Những', 'Bình', 'Thói',
    'Toàn', 'Nó', 'Tôi', 'Chúng', 'Phương', 'Phát', 'Thành', 'Giải', 'Mặt', 'Quần',
    'Giá', 'Cửa', 'Bài', 'Cuộc', 'Bên', 'Cho', 'Bị', 'Giữ', 'Lo', 'Nhận',
    'Tái', 'Chỉ', 'Điện', 'Thu', 'Môi', 'Bản', 'Các', 'Để', 'Buôn', 'Nhậm',
    'Tác', 'Phát', 'Cầu', 'Đối', 'Gánh', 'Tổng', 'Hiện', 'Tiền', 'Nguyên', 'Nằm',
    'Kết', 'Trúng', 'Ăn', 'Bàn', 'Sản', 'Việt', 'Nước', 'Dẹp', 'Đỡ', 'Trau',
    'Cất', 'Gặt', 'Nộp', 'Đóng', 'Phù', 'Đao', 'Hiểm', 'Lương', 'Rải', 'Tưới',
    'Rắc', 'Say', 'Do', 'Chán', 'Vấp', 'Sảy', 'Gật', 'Hàng', 'Việc'
)

def get_hira(text):
    if not text: return ""
    res = kks.convert(text)
    return ''.join([r['hira'] for r in res])

def get_han_viet(word_str):
    if not word_str: return ""
    hv_list = []
    for c in word_str:
        if c in PREFERRED_HV:
            hv_list.append(PREFERRED_HV[c])
        elif '\u4e00' <= c <= '\u9fff':
            hv_list.append(c)
    return ' '.join(hv_list)

def clean_txt(t):
    if not t: return ''
    t = t.replace('\r', '').replace('\n', ' ').strip()
    t = re.sub(r'\s+', ' ', t)
    return t

import unicodedata

def clean_word_title(w_str):
    if not w_str: return ""
    # Normalize unicode NFD -> NFC and strip combining marks
    w_str = unicodedata.normalize('NFC', w_str)
    w_str = ''.join(c for c in unicodedata.normalize('NFD', w_str) if unicodedata.category(c) != 'Mn')
    cleaned = re.sub(r'[A-ZÀÁẢẠÃĂẰẮẲẶẴÂẦẤẨẬẪĐÈÉẺẸẼÊỀẾỂỆỄÌÍỈỊĨÒÓỎỌÕÔỒỐỔỘỖƠỜỚỞỢỠÙÚỦỤŨƯỪỨỬỰỮỲÝỶỴỸa-zàáảạãăằắẳặẵâầấẩậẫđèéẻẹẽêềếểệễìíỉịĩòóỏọõôồốổộỗơờớởợỡùúủụũưừứửựữỳýỷỵỹ\,\;\:\?\!\(\)\.\.\.]', '', w_str).strip()
    return cleaned if cleaned else w_str

def split_ja_and_vi(text):
    if not text: return '', ''
    text = text.replace('\r', '').replace('\n', ' ').strip()
    
    for punct in ['。', '！', '？']:
        if punct in text:
            parts = text.split(punct, 1)
            ja_p = parts[0].strip() + punct
            vi_p = parts[1].strip()
            if vi_p.startswith('-') or vi_p.startswith(':'):
                vi_p = vi_p[1:].strip()
            return ja_p, vi_p
            
    for sep in [' - ', ' – ', ' : ', ' :']:
        if sep in text:
            parts = text.split(sep, 1)
            ja_p = parts[0].strip()
            vi_p = parts[1].strip()
            if any('\u4e00' <= c <= '\u9fff' or '\u3040' <= c <= '\u30ff' for c in ja_p):
                return ja_p, vi_p
                
    for word in VI_LEAD_WORDS:
        idx = text.find(' ' + word + ' ')
        if idx != -1:
            ja_p = text[:idx].strip()
            vi_p = text[idx:].strip()
            return ja_p, vi_p
        if text.startswith(word + ' '):
            return '', text.strip()
            
    m = re.search(r'^([^\nA-ZÀÁẢẠÃĂẰẮẲẶẴÂẦẤẨẬẪĐÈÉẺẸẼÊỀẾỂỆỄÌÍỈỊĨÒÓỎỌÕÔỒỐỔỘỖƠỜỚỞỢỠÙÚỦỤŨƯỪỨỬỰỮỲÝỶỴỸ]+)([\s\-\:]+)([A-ZÀÁẢẠÃĂẰẮẲẶẴÂẦẤẨẬẪĐÈÉẺẸẼÊỀẾỂỆỄÌÍỈỊĨÒÓỎỌÕÔỒỐỔỘỖƠỜỚỞỢỠÙÚỦỤŨƯỪỨỬỰỮỲÝỶỴỸ][a-zàáảạãăằắẳặẵâầấẩậẫđèéẻẹẽêềếểệễìíỉịĩòóỏọõôồốổộỗơờớởợỡùúủụũưừứửựữỳýỷỵỹ\s].*)$', text)
    if m:
        ja_p = m.group(1).strip()
        vi_p = m.group(3).strip()
        return ja_p, vi_p

    return text.strip(), ''

HEADER_BLACK_LIST = {
    '言葉', '読み方', '意味', '例文', '番号', '章', 'HẬU', 'TỐ', 'TỪ', 'VỰNG', 'VÍ', 'DỤ',
    '動詞', '名詞', '形容詞', '副詞', '接続詞', '複合動詞', 'カタカナ', 'TIỀN TỐ'
}

CHAPTER_WORD_TYPES = {
    "1": "Động từ", "2": "Động danh từ", "3": "Danh từ",
    "4": "Tính từ -i", "5": "Tính từ -na", "6": "Phó từ + Từ nối",
    "7": "Động từ ghép", "8": "Katakana", "9": "Tổng hợp",
    "10": "Phân biệt từ vựng", "11": "Tiền tố / Hậu tố"
}

def parse_pdf_all():
    doc = fitz.open(pdf_path)
    print(f"Opened PDF: {pdf_path} ({len(doc)} pages)")
    
    all_words = []
    current_ch = "1"
    
    # ---------------------------------------------------------
    # PART 1: Chapters 1 to 9 (Pages 3 - 124)
    # ---------------------------------------------------------
    for page_idx in range(2, 124):
        page = doc[page_idx]
        words = page.get_text('words')
        
        main_words = [w for w in words if (w[3] - w[1]) >= 7.0]
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
                
        if not unique_ids:
            continue
            
        ex_words = [w for w in main_words if w[0] >= 270]
        ex_words.sort(key=lambda k: (k[1], k[0]))
        
        ex_lines = []
        for w in ex_words:
            if not ex_lines or abs(w[1] - ex_lines[-1]['y']) > 3.5:
                ex_lines.append({'y': w[1], 'words': [w]})
            else:
                ex_lines[-1]['words'].append(w)
                
        page_ex_blocks = []
        for el in ex_lines:
            words_in_l = sorted(el['words'], key=lambda k: k[0])
            l_str = ""
            prev_x1 = None
            for w in words_in_l:
                if not l_str:
                    l_str = w[4]
                elif (w[0] - prev_x1) > 1.0:
                    l_str += ' ' + w[4]
                else:
                    l_str += w[4]
                prev_x1 = w[2]
            l_str = clean_txt(l_str)
            if l_str and not l_str.startswith('1 章') and not l_str.startswith('2 章') and not '例文' in l_str:
                page_ex_blocks.append({'y': el['y'], 'text': l_str})
                
        grouped_examples = []
        curr_ex = None
        for b in page_ex_blocks:
            txt = b['text']
            ja_p, vi_p = split_ja_and_vi(txt)
            if txt.startswith('・') or (not curr_ex and ja_p and any('\u4e00' <= c <= '\u9fff' or '\u3040' <= c <= '\u30ff' for c in ja_p)):
                if curr_ex:
                    grouped_examples.append(curr_ex)
                curr_ex = {'start_y': b['y'], 'end_y': b['y'], 'ja': [ja_p] if ja_p else [txt], 'vi': [vi_p] if vi_p else []}
            else:
                if curr_ex:
                    if vi_p:
                        if ja_p: curr_ex['ja'].append(ja_p)
                        curr_ex['vi'].append(vi_p)
                    else:
                        has_ja = any('\u4e00' <= c <= '\u9fff' or '\u3040' <= c <= '\u30ff' for c in txt)
                        if has_ja and not curr_ex['vi']:
                            curr_ex['ja'].append(txt)
                        else:
                            curr_ex['vi'].append(txt)
                    curr_ex['end_y'] = b['y']
        if curr_ex:
            grouped_examples.append(curr_ex)
            
        for i, (item_id, id_y0, id_y1) in enumerate(unique_ids):
            top_b = id_y0 - 15 if i == 0 else (unique_ids[i-1][1] + id_y0) / 2
            bot_b = 785 if i + 1 == len(unique_ids) else (id_y0 + unique_ids[i+1][1]) / 2
            
            row_words = [w for w in main_words if top_b <= w[1] < bot_b and w[4].strip() not in HEADER_BLACK_LIST]
            
            if current_ch == "8" or page_idx >= 115:
                col_w_items = [w for w in row_words if 80 <= w[0] < 130 and any('\u4e00' <= c <= '\u9fff' or '\u3040' <= c <= '\u30ff' for c in w[4])]
                col_r_items = []
            else:
                col_w_items = [w for w in row_words if 85 <= w[0] < 130]
                col_r_items = [w for w in row_words if 130 <= w[0] < 192]
                if not col_w_items and col_r_items:
                    col_w_items = col_r_items
                    col_r_items = []
                elif not col_w_items:
                    col_w_items = [w for w in row_words if 85 <= w[0] < 192]

            col_m_items = [w for w in row_words if 192 <= w[0] < 270]
            
            def build_str(w_list, sep=''):
                if not w_list: return ""
                lines_map = []
                for w in sorted(w_list, key=lambda k: (round(k[1]/4)*4, k[0])):
                    if not lines_map or abs(w[1] - lines_map[-1]['y']) > 3.5:
                        lines_map.append({'y': w[1], 'words': [w]})
                    else:
                        lines_map[-1]['words'].append(w)
                res_lines = []
                for l in lines_map:
                    words_in_l = sorted(l['words'], key=lambda k: k[0])
                    s = ""
                    prev_x1 = None
                    for w in words_in_l:
                        if not s: s = w[4]
                        elif prev_x1 is not None and (w[0] - prev_x1) > 1.0: s += ' ' + w[4]
                        else: s += w[4]
                        prev_x1 = w[2]
                    res_lines.append(s)
                return clean_txt(sep.join(res_lines))

            word_str = build_str(col_w_items)
            reading_str = build_str(col_r_items)
            meaning_str = build_str(col_m_items, sep=' ')
            
            if not reading_str and word_str:
                reading_str = get_hira(word_str)
                
            item_examples = []
            for ex in grouped_examples:
                if top_b - 5 <= ex['start_y'] < bot_b + 12:
                    ja_t = clean_txt(' '.join(ex['ja']))
                    vi_t = clean_txt(' '.join(ex['vi']))
                    if ja_t:
                        item_examples.append({
                            "ja": ja_t,
                            "reading": get_hira(ja_t),
                            "vi": vi_t
                        })
                        
            if word_str:
                all_words.append({
                    "raw_id": item_id,
                    "word": word_str,
                    "reading": reading_str,
                    "han_viet": get_han_viet(word_str),
                    "word_type": word_type,
                    "meaning": meaning_str or f"Từ vựng N2 ({word_type})",
                    "examples": item_examples
                })

    print(f"Extracted {len(all_words)} words from Chapters 1 to 9.")

    # ---------------------------------------------------------
    # PART 2: Chapter 10 (Pages 125-133: Distinctions)
    # ---------------------------------------------------------
    ch10_words = []
    for page_idx in range(124, 133):
        page = doc[page_idx]
        words = page.get_text('words')
        words = [w for w in words if 110 <= w[1] <= 790]
        
        w_main = [w for w in words if (w[3] - w[1]) >= 7.0]
        head_tokens = []
        for w in w_main:
            txt = w[4].strip()
            if w[0] < 140 and any('\u4e00' <= c <= '\u9fff' or '\u3040' <= c <= '\u30ff' for c in txt):
                if not txt.startswith('・') and not txt.startswith('10.') and not '章' in txt:
                    head_tokens.append(w)
                    
        head_tokens.sort(key=lambda k: k[1])
        clusters = []
        for ht in head_tokens:
            if not clusters or abs(ht[1] - clusters[-1][-1][1]) > 15:
                clusters.append([ht])
            else:
                clusters[-1].append(ht)
                
        for i, cl in enumerate(clusters):
            top_y = cl[0][1] - 14
            bot_y = clusters[i+1][0][1] - 14 if i + 1 < len(clusters) else 790
            
            row_words = [w for w in words if top_y <= w[1] < bot_y]
            word_toks = [w for w in row_words if w[0] < 140 and (w[3]-w[1]) >= 7.0]
            word_toks.sort(key=lambda k: (round(k[1]/5)*5, k[0]))
            word_str = clean_txt(''.join([w[4].strip() for w in word_toks]))
            
            furi_toks = [w for w in row_words if w[0] < 140 and (w[3]-w[1]) < 7.0]
            furi_toks.sort(key=lambda k: k[0])
            reading = clean_txt(''.join([w[4].strip() for w in furi_toks]))
            if not reading: reading = get_hira(word_str)
            
            m_toks = [w for w in row_words if 140 <= w[0] < 235 and (w[3]-w[1]) >= 7.0]
            m_lines = []
            for w in m_toks:
                if not m_lines or abs(w[1] - m_lines[-1]['y']) > 4.0:
                    m_lines.append({'y': w[1], 'words': [w]})
                else:
                    m_lines[-1]['words'].append(w)
            m_parts = []
            for ml in m_lines:
                words_in_l = sorted(ml['words'], key=lambda k: k[0])
                m_parts.append(' '.join([w[4] for w in words_in_l]))
            meaning_str = clean_txt(' '.join(m_parts))
            
            ex_words = [w for w in row_words if w[0] >= 235]
            ex_words.sort(key=lambda k: (round(k[1]/4)*4, k[0]))
            ex_lines = []
            for w in ex_words:
                if (w[3] - w[1]) < 7.0: continue
                if not ex_lines or abs(w[1] - ex_lines[-1]['y']) > 3.5:
                    ex_lines.append({'y': w[1], 'words': [w]})
                else:
                    ex_lines[-1]['words'].append(w)
                    
            ex_list = []
            curr_ja = []
            curr_vi = []
            for el in ex_lines:
                words_in_l = sorted(el['words'], key=lambda k: k[0])
                line_txt = clean_txt(' '.join([w[4] for w in words_in_l]))
                if not line_txt: continue
                ja_p, vi_p = split_ja_and_vi(line_txt)
                if line_txt.startswith('・') or (ja_p and any('\u4e00' <= c <= '\u9fff' or '\u3040' <= c <= '\u30ff' for c in ja_p)):
                    if curr_ja:
                        ex_list.append({'ja': clean_txt(' '.join(curr_ja)), 'reading': get_hira(clean_txt(' '.join(curr_ja))), 'vi': clean_txt(' '.join(curr_vi))})
                        curr_ja = []
                        curr_vi = []
                    curr_ja.append(ja_p if ja_p else line_txt)
                    if vi_p: curr_vi.append(vi_p)
                else:
                    if vi_p:
                        if ja_p: curr_ja.append(ja_p)
                        curr_vi.append(vi_p)
                    else:
                        has_ja = any('\u4e00' <= c <= '\u9fff' or '\u3040' <= c <= '\u30ff' for c in line_txt)
                        if has_ja and not curr_vi: curr_ja.append(line_txt)
                        else: curr_vi.append(line_txt)
            if curr_ja:
                ex_list.append({'ja': clean_txt(' '.join(curr_ja)), 'reading': get_hira(clean_txt(' '.join(curr_ja))), 'vi': clean_txt(' '.join(curr_vi))})
                
            if word_str:
                ch10_words.append({
                    "word": word_str,
                    "reading": reading,
                    "han_viet": get_han_viet(word_str),
                    "word_type": "Phân biệt từ vựng",
                    "meaning": meaning_str or "Phân biệt từ vựng N2",
                    "examples": ex_list
                })

    print(f"Extracted {len(ch10_words)} words from Chapter 10.")
    all_words.extend(ch10_words)

    # ---------------------------------------------------------
    # PART 3: Chapter 11 (Pages 134-145: Prefixes & Suffixes)
    # ---------------------------------------------------------
    ch11_words = []
    for page_idx in range(133, 146):
        page = doc[page_idx]
        words = page.get_text('words')
        words = [w for w in words if 115 <= w[1] <= 790]
        
        col2_words = [w for w in words if 135 <= w[0] < 248]
        w_main = [w for w in col2_words if (w[3] - w[1]) >= 7.0]
        
        kanji_tokens = []
        for w in w_main:
            txt = w[4].strip()
            if any('\u4e00' <= c <= '\u9fff' or '\u3040' <= c <= '\u30ff' for c in txt):
                if not txt.startswith('・') and not txt.startswith('Ý') and not txt.startswith('Ý'):
                    kanji_tokens.append(w)
                    
        kanji_tokens.sort(key=lambda k: k[1])
        clusters = []
        for kt in kanji_tokens:
            if not clusters or abs(kt[1] - clusters[-1][-1][1]) > 14:
                clusters.append([kt])
            else:
                clusters[-1].append(kt)
                
        for i, cl in enumerate(clusters):
            top_y = cl[0][1] - 12
            bot_y = clusters[i+1][0][1] - 12 if i + 1 < len(clusters) else 790
            
            row_words = [w for w in words if top_y <= w[1] < bot_y]
            word_toks = [w for w in row_words if 135 <= w[0] < 248 and (w[3]-w[1]) >= 7.0]
            word_toks.sort(key=lambda k: (round(k[1]/5)*5, k[0]))
            
            # Meaning tokens can be up to x0 < 380 (e.g. Page 145)
            m_toks = [w for w in row_words if 135 <= w[0] < 380 and (w[3]-w[1]) >= 7.0]
            
            ja_word_parts = []
            vi_meaning_parts = []
            
            for w in word_toks:
                txt = w[4].strip()
                has_ja = any('\u4e00' <= c <= '\u9fff' or '\u3040' <= c <= '\u30ff' for c in txt)
                if has_ja or txt in ['（な）', '(な)', '（する）', '(する)']:
                    ja_word_parts.append(txt)
                else:
                    vi_meaning_parts.append(txt)
                    
            for w in m_toks:
                txt = w[4].strip()
                has_ja = any('\u4e00' <= c <= '\u9fff' or '\u3040' <= c <= '\u30ff' for c in txt)
                if not has_ja and txt not in ['（な）', '(な)', '（する）', '(する)'] and txt not in HEADER_BLACK_LIST:
                    if txt not in vi_meaning_parts:
                        vi_meaning_parts.append(txt)
                    
            furi_toks = [w for w in row_words if 135 <= w[0] < 248 and (w[3]-w[1]) < 7.0]
            furi_toks.sort(key=lambda k: k[0])
            reading = ''.join([w[4].strip() for w in furi_toks])
            
            word_str = clean_txt(''.join(ja_word_parts))
            meaning_str = clean_txt(' '.join(vi_meaning_parts))
            
            if not word_str or word_str.startswith('・') or word_str in HEADER_BLACK_LIST:
                continue
                
            if not reading: reading = get_hira(word_str)
            
            ex_words = [w for w in row_words if w[0] >= 248]
            ex_words.sort(key=lambda k: (round(k[1]/4)*4, k[0]))
            ex_lines = []
            for w in ex_words:
                if (w[3] - w[1]) < 7.0: continue
                if not ex_lines or abs(w[1] - ex_lines[-1]['y']) > 3.5:
                    ex_lines.append({'y': w[1], 'words': [w]})
                else:
                    ex_lines[-1]['words'].append(w)
                    
            ex_list = []
            curr_ja = []
            curr_vi = []
            for el in ex_lines:
                words_in_l = sorted(el['words'], key=lambda k: k[0])
                line_txt = clean_txt(' '.join([w[4] for w in words_in_l]))
                if not line_txt: continue
                ja_p, vi_p = split_ja_and_vi(line_txt)
                if line_txt.startswith('・') or (ja_p and any('\u4e00' <= c <= '\u9fff' or '\u3040' <= c <= '\u30ff' for c in ja_p)):
                    if curr_ja:
                        ex_list.append({'ja': clean_txt(' '.join(curr_ja)), 'reading': get_hira(clean_txt(' '.join(curr_ja))), 'vi': clean_txt(' '.join(curr_vi))})
                        curr_ja = []
                        curr_vi = []
                    curr_ja.append(ja_p if ja_p else line_txt)
                    if vi_p: curr_vi.append(vi_p)
                else:
                    if vi_p:
                        if ja_p: curr_ja.append(ja_p)
                        curr_vi.append(vi_p)
                    else:
                        has_ja = any('\u4e00' <= c <= '\u9fff' or '\u3040' <= c <= '\u30ff' for c in line_txt)
                        if has_ja and not curr_vi: curr_ja.append(line_txt)
                        else: curr_vi.append(line_txt)
            if curr_ja:
                ex_list.append({'ja': clean_txt(' '.join(curr_ja)), 'reading': get_hira(clean_txt(' '.join(curr_ja))), 'vi': clean_txt(' '.join(curr_vi))})
                
            ch11_words.append({
                "word": word_str,
                "reading": reading,
                "han_viet": get_han_viet(word_str),
                "word_type": "Tiền tố / Hậu tố",
                "meaning": meaning_str or "Tiền tố / Hậu tố N2",
                "examples": ex_list
            })

    print(f"Extracted {len(ch11_words)} words from Chapter 11.")
    all_words.extend(ch11_words)
    
    print(f"\nGRAND TOTAL VOCABULARY EXTRACTED FROM PDF: {len(all_words)} words!")
    return all_words

if __name__ == '__main__':
    vocab_list = parse_pdf_all()
    
    cleaned_words = []
    seen = set()
    for w in vocab_list:
        w_str = clean_word_title(clean_txt(w['word']))
        m_str = clean_txt(w['meaning'])
        r_str = clean_txt(w['reading'])
        if not w_str or w_str in HEADER_BLACK_LIST: continue
        
        pair_key = (w_str, m_str)
        if pair_key in seen and len(w_str) < 12:
            continue
        seen.add(pair_key)
        
        if not r_str or r_str == w_str: r_str = get_hira(w_str)
        hv_str = get_han_viet(w_str)
        
        cleaned_words.append({
            "word": w_str,
            "reading": r_str,
            "han_viet": hv_str,
            "word_type": w['word_type'],
            "meaning": m_str or f"Từ vựng N2 ({w['word_type']})",
            "examples": w['examples']
        })
        
    total_words = len(cleaned_words)
    print(f"Final cleaned unique words: {total_words}")
    
    DAY_TITLES = [
        "BUỔI 1: N2 Động từ (Phần 1)",
        "BUỔI 2: N2 Động từ (Phần 2)",
        "BUỔI 3: N2 Động từ & Động danh từ (Suru Verbs)",
        "BUỔI 4: N2 Động danh từ & Danh từ (Phần 1)",
        "BUỔI 5: N2 Danh từ (Phần 2)",
        "BUỔI 6: N2 Danh từ, Tính từ -i & Tính từ -na",
        "BUỔI 7: N2 Phó từ, Từ nối & Động từ ghép",
        "BUỔI 8: N2 Katakana & Từ vựng tổng hợp",
        "BUỔI 9: N2 Phân biệt từ vựng & Tiền tố - Hậu tố (Phần 1)",
        "BUỔI 10: N2 Tiền tố - Hậu tố (Phần 2) & Ôn tập tổng hợp"
    ]
    
    words_per_day = total_words // 10
    remainder = total_words % 10
    
    output_dir = os.path.join('src', 'data')
    os.makedirs(output_dir, exist_ok=True)
    
    curr_idx = 0
    for day in range(1, 11):
        count_today = words_per_day + (1 if day <= remainder else 0)
        day_words = cleaned_words[curr_idx : curr_idx + count_today]
        curr_idx += count_today
        
        formatted_words = []
        for widx, w in enumerate(day_words, start=1):
            formatted_words.append({
                "id": widx,
                "word": w["word"],
                "reading": w["reading"],
                "han_viet": w["han_viet"],
                "word_type": w["word_type"],
                "meaning": w["meaning"],
                "examples": w["examples"]
            })
            
        file_path = os.path.join(output_dir, f"lesson_{day:02d}.json")
        lesson_data = {
            "lesson_id": f"lesson_{day:02d}",
            "lesson_name": DAY_TITLES[day - 1],
            "level": "N2",
            "words": formatted_words
        }
        
        with open(file_path, 'w', encoding='utf-8') as fp:
            json.dump(lesson_data, fp, ensure_ascii=False, indent=2)
            
        print(f"Saved {file_path} with {len(formatted_words)} words.")
