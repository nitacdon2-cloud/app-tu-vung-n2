import pymupdf as fitz
import os, sys, re, json, pykakasi

sys.stdout.reconfigure(encoding='utf-8')
kks = pykakasi.kakasi()

pdf_path = os.path.join('FILE SÁCH KANJI - TV - NP N2 (PDF)', 'PDF TỪ VỰNG N2', 'N2 - từ vựng 201223.pdf')
doc = fitz.open(pdf_path)

def get_hira(text):
    if not text: return ""
    res = kks.convert(text)
    return ''.join([r['hira'] for r in res])

def clean_txt(t):
    if not t: return ''
    t = t.replace('\r', '').replace('\n', ' ').strip()
    t = re.sub(r'\s+', ' ', t)
    return t

# Han-Viet dict loader
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
    '家': 'GIA', '借': 'TÁ', '手': 'THỦ', '間': 'GIAN', '不': 'BẤT',
    '無': 'VÔ', '非': 'PHI', '未': 'VỊ', '超': 'SIÊU', '各': 'CÁC',
    '副': 'PHÓ', '名': 'DANH', '全': 'TOÀN', '総': 'TỔNG', '現': 'HIỆN',
    '前': 'TIỀN', '元': 'NGUYÊN', '故': 'CỐ', '内': 'NỘI', '外': 'NGOẠI',
    '化': 'HÓA', '目': 'MỤC', '当': 'ĐƯƠNG', '的': 'ĐÍCH', '風': 'PHONG',
    '感': 'CẢM'
}

def get_han_viet(word_str):
    if not word_str: return ""
    hv_list = []
    for c in word_str:
        if c in PREFERRED_HV:
            hv_list.append(PREFERRED_HV[c])
        elif '\u4e00' <= c <= '\u9fff':
            hv_list.append(c)
    return ' '.join(hv_list)

ch11_words = []

for page_idx in range(133, 146):
    page = doc[page_idx]
    words = page.get_text('words')
    
    # Filter out header and footer
    words = [w for w in words if 115 <= w[1] <= 790]
    
    col2_words = [w for w in words if 135 <= w[0] < 248]
    w_main = [w for w in col2_words if (w[3] - w[1]) >= 7.2]
    
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
        
        word_toks = [w for w in row_words if 135 <= w[0] < 248 and (w[3]-w[1]) >= 7.2]
        word_toks.sort(key=lambda k: (round(k[1]/5)*5, k[0]))
        
        ja_word_parts = []
        vi_meaning_parts = []
        
        for w in word_toks:
            txt = w[4].strip()
            if any('\u4e00' <= c <= '\u9fff' or '\u3040' <= c <= '\u30ff' for c in txt) or txt in ['（な）', '(な)', '（する）', '(する)']:
                if not any(v in txt for v in ['Mang', 'Tính', 'Không', 'Chưa', 'Theo', 'Cảm', 'Tiền', 'Phí', 'Kiểu', 'Tự', 'Thứ', 'Một', 'Cao', 'Thời', 'Bộ', 'Sự', 'Phương', 'Phát', 'Trông', 'Nêm', 'Tòa', 'Hãy', 'Người', 'Xe', 'Thưởng', 'Dầu', 'Cái', 'Sản', 'Thường', 'Trái', 'Nói', 'Rất', 'Quá', 'Dốc', 'Dùng', 'Thực']):
                    ja_word_parts.append(txt)
                else:
                    vi_meaning_parts.append(txt)
            else:
                vi_meaning_parts.append(txt)
                
        furi_toks = [w for w in row_words if 135 <= w[0] < 248 and (w[3]-w[1]) < 7.2]
        furi_toks.sort(key=lambda k: k[0])
        reading = ''.join([w[4].strip() for w in furi_toks])
        
        word_str = clean_txt(''.join(ja_word_parts))
        meaning_str = clean_txt(' '.join(vi_meaning_parts))
        
        if not word_str or word_str.startswith('・') or word_str in ['TIỀN TỐ', 'HẬU TỐ', 'TỪ VỰNG', 'VÍ DỤ']:
            continue
            
        if not reading:
            reading = get_hira(word_str)
            
        ex_words = [w for w in row_words if w[0] >= 248]
        ex_words.sort(key=lambda k: (round(k[1]/4)*4, k[0]))
        
        ex_lines = []
        for w in ex_words:
            if (w[3] - w[1]) < 7.0:
                continue
            if not ex_lines or abs(w[1] - ex_lines[-1]['y']) > 3.5:
                ex_lines.append({'y': w[1], 'words': [w]})
            else:
                ex_lines[-1]['words'].append(w)
                
        ex_list = []
        curr_ja = []
        curr_vi = []
        
        for el in ex_lines:
            line_txt = clean_txt(' '.join([w[4] for w in sorted(el['words'], key=lambda k: k[0])]))
            if not line_txt: continue
            
            if line_txt.startswith('・'):
                if curr_ja:
                    ex_list.append({
                        'ja': clean_txt(' '.join(curr_ja)),
                        'reading': get_hira(clean_txt(' '.join(curr_ja))),
                        'vi': clean_txt(' '.join(curr_vi))
                    })
                    curr_ja = []
                    curr_vi = []
                curr_ja.append(line_txt)
            else:
                has_ja = any('\u4e00' <= c <= '\u9fff' or '\u3040' <= c <= '\u30ff' for c in line_txt)
                if has_ja and not curr_vi:
                    curr_ja.append(line_txt)
                else:
                    curr_vi.append(line_txt)
                    
        if curr_ja:
            ex_list.append({
                'ja': clean_txt(' '.join(curr_ja)),
                'reading': get_hira(clean_txt(' '.join(curr_ja))),
                'vi': clean_txt(' '.join(curr_vi))
            })
            
        ch11_words.append({
            'page': page_idx + 1,
            'word': word_str,
            'reading': reading,
            'han_viet': get_han_viet(word_str),
            'word_type': 'Tiền tố / Hậu tố',
            'meaning': meaning_str or "Tiền tố / Hậu tố N2",
            'examples': ex_list
        })

print(f"Extracted {len(ch11_words)} words from Chapter 11!")
for idx, w in enumerate(ch11_words[:20], 1):
    print(f"[{idx}] {w['word']} ({w['reading']}) -> {w['meaning']}")
    for ex in w['examples']:
        print(f"    EX: {ex['ja']} => {ex['vi']}")
