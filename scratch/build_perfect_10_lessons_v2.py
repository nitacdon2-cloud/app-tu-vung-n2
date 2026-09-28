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

# We will collect words for Lesson 1 to 10
# Lesson 1: Words 1-150 (Động từ Phần 1)
# Lesson 2: Words 151-315 (Động từ Phần 2)
# Lesson 3: Words 316-467 (Động danh từ)
# Lesson 4: Words 468-646 (Danh từ Phần 1)
# Lesson 5: Words 647-825 (Danh từ Phần 2)
# Lesson 6: Words 826-882 (Tính từ い / な)
# Lesson 7: Words 883-1103 (Phó từ + Liên từ & Phức hợp)
# Lesson 8: Words 1104-1194 (Katakana)
# Lesson 9: Phân biệt từ vựng (Chương 10)
# Lesson 10: Tiền tố - Hậu tố (Chương 11 - Parent/Child Card Structure)

print("Building data structure...")
