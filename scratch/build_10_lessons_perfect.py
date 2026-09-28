import sys
import pymupdf as fitz
import json
import re
import os

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'FILE SÁCH KANJI - TV - NP N2 (PDF)/PDF TỪ VỰNG N2/N2 - từ vựng 201223.pdf'
doc = fitz.open(pdf_path)

# Han-Viet dictionary
PREFERRED_HV = {
    '引': 'DẪN', '注': 'CHÚ', '酔': 'TÚY', '凹': 'AO', '齧': 'NIẾT', '躓': 'CHÍ', '頷': 'HÀM',
    '吐': 'THỔ', '診': 'CHẨN', '痛': 'THỐNG', '傷': 'THƯƠNG', '見': 'KIẾN', '舞': 'VŨ', '転': 'CHUYỂN',
    '測': 'TRẮC', '計': 'KẾ', '量': 'LƯỢNG', '配': 'PHỐI', '放': 'PHÓNG', '床': 'SÀN', '切': 'THIẾT',
    '重': 'TRỌNG', '空': 'KHÔNG', '行': 'HÀNH', '生': 'SINH', '相': 'TƯƠNG', '場': 'TRƯỜNG', '分': 'PHÂN',
    '長': 'TRƯỜNG', '悪': 'ÁC', '強': 'CƯỜNG', '正': 'CHÍNH', '好': 'HẢO', '大': 'ĐẠI', '小': 'TIỂU',
    '高': 'CAO', '安': 'AN', '新': 'TÂN', '古': 'CỔ', '非': 'PHI', '不': 'BẤT', '無': 'VÔ', '未': 'VỊ',
    '再': 'TÁI', '超': 'SIÊU', '名': 'DANH', '全': 'TOÀN', '総': 'TỔNG', '化': 'HÓA', '感': 'CẢM',
    '性': 'TÍNH', '製': 'CHẾ', '金': 'KIM', '代': 'ĐẠI', '料': 'LIỆU', '賃': 'NHẪM', '風': 'PHONG'
}

def get_han_viet(word_str):
    if not word_str:
        return ""
    res = []
    for ch in word_str:
        if ch in PREFERRED_HV:
            res.append(PREFERRED_HV[ch])
    return " ".join(res)

print(f"Loaded PDF with {len(doc)} pages.")
