import re, sys
sys.stdout.reconfigure(encoding='utf-8')

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

tests = [
    '・コップに牛乳をつぐ。Đổ sữa vào cốc.',
    '・畑 に種をまく。Gieo hạt lên ruộng.',
    '・時間をつぶす - Giết thời gian',
    '・株でお金を儲ける。Kiếm lời nhờ số cổ phần.',
    '・靴ひもがほどける。Tuột dây giày.',
    '・エプロンの紐をほどく。Cởi dây tạp dề.',
    '・罪をかぶせられた。Bị đổ tội.',
    '・３ヶ月でN1 を取るのは不可能だ。',
    '・故ホー・チ・ミン主席 の遺体 Di thể của chủ tịch Hồ Chí Minh'
]

for t in tests:
    ja, vi = split_ja_and_vi(t)
    print(f"ORIG: '{t}'")
    print(f"   => JA: '{ja}'")
    print(f"   => VI: '{vi}'\n")
