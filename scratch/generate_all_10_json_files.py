import sys
import pymupdf as fitz
import json
import re
import os

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'FILE SÁCH KANJI - TV - NP N2 (PDF)/PDF TỪ VỰNG N2/N2 - từ vựng 201223.pdf'
doc = fitz.open(pdf_path)

PREFERRED_HV = {
    '引': 'DẪN', '注': 'CHÚ', '酔': 'TÚY', '凹': 'AO', '齧': 'NIẾT', '躓': 'CHÍ', '頷': 'HÀM',
    '吐': 'THỔ', '診': 'CHẨN', '痛': 'THỐNG', '傷': 'THƯƠNG', '見': 'KIẾN', '舞': 'VŨ', '転': 'CHUYỂN',
    '測': 'TRẮC', '計': 'KẾ', '量': 'LƯỢNG', '配': 'PHỐI', '放': 'PHÓNG', '床': 'SÀN', '切': 'THIẾT',
    '重': 'TRỌNG', '空': 'KHÔNG', '行': 'HÀNH', '生': 'SINH', '相': 'TƯƠNG', '場': 'TRƯỜNG', '分': 'PHÂN',
    '長': 'TRƯỜNG', '悪': 'ÁC', '強': 'CƯỜNG', '正': 'CHÍNH', '好': 'HẢO', '大': 'ĐẠI', '小': 'TIỂU',
    '高': 'CAO', '安': 'AN', '新': 'TÂN', '古': 'CỔ', '非': 'PHI', '不': 'BẤT', '無': 'VÔ', '未': 'VỊ',
    '再': 'TÁI', '超': 'SIÊU', '名': 'DANH', '全': 'TOÀN', '総': 'TỔNG', '化': 'HÓA', '感': 'CẢM',
    '性': 'TÍNH', '製': 'CHẾ', '金': 'KIM', '代': 'ĐẠI', '料': 'LIỆU', '賃': 'NHẪM', '風': 'PHONG',
    '常': 'THƯỜNG', '識': 'THỨC', '科': 'KHOA', '学': 'HỌC', '的': 'ĐÍCH', '勝': 'THẮNG', '手': 'THỦ',
    '満': 'MÃN', '足': 'TÚC', '意': 'Ý', '味': 'VỊ', '理': 'LÝ', '解': 'GIẢI', '関': 'QUAN', '心': 'TÂM',
    '結': 'KẾT', '論': 'LUẬN', '義': 'NGHĨA', '務': 'VỤ', '事': 'SỰ', '態': 'THÁI', '資': 'TƯ', '本': 'BẢN'
}

def get_han_viet(word_str):
    if not word_str:
        return ""
    res = []
    for ch in word_str:
        if ch in PREFERRED_HV:
            res.append(PREFERRED_HV[ch])
    return " ".join(res)

# Read all words from Chapters 1 to 8 (Pages 3 to 124)
raw_entries = []
curr_sub = "1.1 動詞"

for p in range(2, 124):
    page = doc[p]
    text = page.get_text()
    
    # Check section header
    sub_m = re.search(r'(\d{1,2}\.\d{1,2}\s*[-・\w\s/]*)', text)
    if sub_m:
        raw_s = sub_m.group(1).strip().replace('\n', ' ')
        if raw_s.startswith('1.'):
            curr_sub = f"📌 {raw_s} 動詞"
        elif raw_s.startswith('2.'):
            curr_sub = f"📌 {raw_s} 動名詞"
        elif raw_s.startswith('3.'):
            curr_sub = f"📌 {raw_s} 名詞"
        elif raw_s.startswith('5.'):
            curr_sub = f"📌 {raw_s} な形容詞"
        elif raw_s.startswith('6.'):
            curr_sub = f"📌 {raw_s} 副詞＋接続詞"
        elif raw_s.startswith('7.'):
            curr_sub = f"📌 {raw_s} 複合動詞"
        elif raw_s.startswith('8.'):
            curr_sub = f"📌 {raw_s} カタカナ"
        else:
            curr_sub = f"📌 {raw_s}"

    # Extract words from blocks
    blocks = page.get_text('blocks')
    for b in blocks:
        b_text = b[4].strip()
        lines = [l.strip() for l in b_text.split('\n') if l.strip()]
        if not lines:
            continue
        if re.match(r'^\d{1,4}$', lines[0]):
            wid = int(lines[0])
            word_str = lines[1] if len(lines) > 1 else ""
            reading_str = lines[2] if len(lines) > 2 else ""
            meaning_str = lines[3] if len(lines) > 3 else ""
            
            # Clean up headers
            if word_str in ['言葉', '読み方', '意味', '例文', '番号', '章', '1 章', '2 章']:
                continue
                
            raw_entries.append({
                "id": wid,
                "word": word_str,
                "reading": reading_str,
                "han_viet": get_han_viet(word_str),
                "word_type": "Từ vựng",
                "meaning": meaning_str,
                "examples": [],
                "sub_section": curr_sub
            })

# Deduplicate & sort by ID
unique_dict = {}
for e in raw_entries:
    if e["id"] not in unique_dict:
        unique_dict[e["id"]] = e

sorted_words = [unique_dict[k] for k in sorted(unique_dict.keys())]
print(f"Extracted {len(sorted_words)} words for Chapters 1-8. Word 1 is '{sorted_words[0]['word']}' ({sorted_words[0]['meaning']})")
