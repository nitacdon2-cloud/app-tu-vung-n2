import sys
import json
import os

sys.stdout.reconfigure(encoding='utf-8')

lesson_10_path = 'src/data/lesson_10.json'

with open(lesson_10_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Define exact Prefix / Suffix hierarchy
PREFIX_SUFFIX_DATA = [
    {
        "parent": {"word": "不〜", "reading": "ふ〜", "meaning": "BẤT 〜 (Không)", "han_viet": "BẤT"},
        "children": [
            {"word": "不可能（な）", "reading": "ふかのう", "meaning": "Không thể nào", "han_viet": "BẤT KHẢ NĂNG", "example": "３ヶ月でN1を取るのは不可能だ。 (Việc lấy N1 trong 3 tháng là điều không thể.)"},
            {"word": "不必要（な）", "reading": "ふひつよう", "meaning": "Không cần thiết", "han_viet": "BẤT TẤT YẾU", "example": "不必要な外出はおやめください。 (Vui lòng hạn chế ra ngoài khi không cần thiết.)"},
            {"word": "不愉快（な）", "reading": "ふゆかい", "meaning": "Không thoải mái, khó chịu", "han_viet": "BẤT DU KHOÁI", "example": "不愉快なコメント (Những bình luận khó chịu)"},
            {"word": "不健康（な）", "reading": "ふけんこう", "meaning": "Không khoẻ, không tốt cho sức khoẻ", "han_viet": "BẤT KIỆN KHANG", "example": "不健康な食生活 (Thói quen ăn uống không tốt cho sức khỏe)"}
        ]
    },
    {
        "parent": {"word": "無〜", "reading": "む〜", "meaning": "VÔ 〜 (Không có)", "han_viet": "VÔ"},
        "children": [
            {"word": "無差別", "reading": "むさべつ", "meaning": "Không phân biệt", "han_viet": "VÔ SAI BIỆT", "example": "無差別に攻撃する (Tấn công không phân biệt)"},
            {"word": "無関心", "reading": "むかんしん", "meaning": "Không quan tâm", "han_viet": "VÔ QUAN TÂM", "example": "政治に無関心だ (Không quan tâm tới chính trị)"},
            {"word": "無頓着", "reading": "むとんちゃく", "meaning": "Không để ý, bừa bãi", "han_viet": "VÔ ĐỒN TRƯỚC", "example": " me (Bừa bãi)"}
        ]
    },
    {
        "parent": {"word": "非〜", "reading": "ひ〜", "meaning": "PHI 〜 (Không, trái với)", "han_viet": "PHI"},
        "children": [
            {"word": "非常識", "reading": "ひじょうしき", "meaning": "Không có ý thức, thiếu thường thức", "han_viet": "PHI THƯỜNG THỨC", "example": "非常識な行動 (Hành động thiếu ý thức)"},
            {"word": "非公式", "reading": "ひこうしき", "meaning": "Không chính thức", "han_viet": "PHI CÔNG THỨC", "example": "非公式の発表 (Phát biểu không chính thức)"},
            {"word": "非科学的", "reading": "ひかがくてき", "meaning": "Không khoa học (phản khoa học)", "han_viet": "PHI KHOA HỌC ĐÍCH", "example": "非科学的な考え (Suy nghĩ phản khoa học)"}
        ]
    },
    {
        "parent": {"word": "未〜", "reading": "み〜", "meaning": "VỊ 〜 (Chưa)", "han_viet": "VỊ"},
        "children": [
            {"word": "未完成", "reading": "みかんせい", "meaning": "Chưa hoàn thành", "han_viet": "VỊ HOÀN THÀNH", "example": "未完成の作品 (Tác phẩm chưa hoàn thành)"},
            {"word": "未解決", "reading": "みかいけつ", "meaning": "Chưa giải quyết", "han_viet": "VỊ GIẢI QUYẾT", "example": "未解決の問題 (Vấn đề chưa được giải quyết)"}
        ]
    },
    {
        "parent": {"word": "再〜", "reading": "さい〜", "meaning": "TÁI 〜 (Lại, làm lại)", "han_viet": "TÁI"},
        "children": [
            {"word": "再出発", "reading": "さいしゅっぱつ", "meaning": "Khởi đầu lại, làm lại từ đầu", "han_viet": "TÁI XUẤT PHÁT", "example": "ゼロから再出発する (Khởi đầu lại từ con số 0)"},
            {"word": "再生産", "reading": "さいせいさん", "meaning": "Tái sản xuất", "han_viet": "TÁI SẢN XUẤT", "example": "再生産する (Tái sản xuất)"}
        ]
    },
    {
        "parent": {"word": "超〜", "reading": "ちょう〜", "meaning": "SIÊU 〜 (Quá, vượt mức)", "han_viet": "SIÊU"},
        "children": [
            {"word": "超満員", "reading": "ちょうまんいん", "meaning": "Quá đông người (chật cứng người)", "han_viet": "SIÊU MÃN VIÊN", "example": "超満員の電車 (Xe điện chật cứng người)"},
            {"word": "超小型", "reading": "ちょうこがた", "meaning": "Cỡ siêu nhỏ", "han_viet": "SIÊU TIỂU HÌNH", "example": "超小型カメラ (Camera siêu nhỏ)"}
        ]
    },
    {
        "parent": {"word": "高〜", "reading": "こう〜", "meaning": "CAO 〜 (Cao, nhiều)", "han_viet": "CAO"},
        "children": [
            {"word": "高カロリー", "reading": "こうかろりー", "meaning": "Hàm lượng Calo cao", "han_viet": "CAO", "example": "高カロリーの食品 (Thực phẩm hàm lượng calo cao)"},
            {"word": "高収入", "reading": "こうしゅうにゅう", "meaning": "Thu nhập cao", "han_viet": "CAO THU NHẬP", "example": "高収入の仕事 (Công việc thu nhập cao)"}
        ]
    },
    {
        "parent": {"word": "〜的", "reading": "〜てき", "meaning": "〜 ĐÍCH (Mang tính, hơi hướng)", "han_viet": "ĐÍCH"},
        "children": [
            {"word": "代表的（な）", "reading": "だいひょうてき", "meaning": "Mang tính biểu tượng", "han_viet": "ĐẠI BIỂU ĐÍCH", "example": "代表的な映画 (Bộ phim mang tính biểu tượng)"},
            {"word": "日常的（な）", "reading": "にちじょうてき", "meaning": "Mang tính chất thường ngày", "han_viet": "NHẬT THƯỜNG ĐÍCH", "example": "日常的な出来事 (Sự việc mang tính chất thường ngày)"},
            {"word": "進歩的（な）", "reading": "しんぽてき", "meaning": "Mang tính tiến bộ", "han_viet": "TIẾN BỘ ĐÍCH", "example": "進歩的な考え (Suy nghĩ mang tính tiến bộ)"},
            {"word": "科学的（な）", "reading": "かがくてき", "meaning": "Mang tính khoa học", "han_viet": "KHOA HỌC ĐÍCH", "example": "科学的な方法 (Phương pháp mang tính khoa học)"},
            {"word": "政治的（な）", "reading": "せいじてき", "meaning": "Mang hơi hướng chính trị", "han_viet": "CHÍNH TRỊ ĐÍCH", "example": "政治的な発言 (Phát ngôn mang hơi hướng chính trị)"}
        ]
    },
    {
        "parent": {"word": "〜風", "reading": "〜ふう", "meaning": "〜 PHONG (Theo kiểu)", "han_viet": "PHONG"},
        "children": [
            {"word": "サラリーマン風", "reading": "さらりーまんふう", "meaning": "Trông kiểu người làm công", "han_viet": "PHONG", "example": "サラリーマン風の男 (Người đàn ông trông kiểu người làm công)"},
            {"word": "関西風", "reading": "かんさいふう", "meaning": "Kiểu Kansai", "han_viet": "QUAN TÂY PHONG", "example": "関西風の味付け (Nêm nếm gia vị theo kiểu Kansai)"},
            {"word": "西洋風", "reading": "せいようふう", "meaning": "Kiểu Tây Âu", "han_viet": "TÂY DƯƠNG PHONG", "example": "西洋風の建物 (Tòa nhà theo kiểu Tây Âu)"}
        ]
    },
    {
        "parent": {"word": "〜感", "reading": "〜かん", "meaning": "〜 CẢM (Mang đến cảm giác)", "han_viet": "CẢM"},
        "children": [
            {"word": "存在感", "reading": "そんざいかん", "meaning": "Cảm giác tồn tại", "han_viet": "TỒN TẠI CẢM", "example": "存在感がある人 (Người mang đến cảm giác tồn tại)"},
            {"word": "安定感", "reading": "あんていかん", "meaning": "Cảm giác ổn định, chắc chắn", "han_viet": "AN ĐỊNH CẢM", "example": "安定感がある車 (Xe ô tô có cảm giác an toàn chắc chắn)"},
            {"word": "清潔感", "reading": "せいけつかん", "meaning": "Cảm giác gọn gàng sạch sẽ", "han_viet": "THANH KHIẾT CẢM", "example": "清潔感がある男 (Người đàn ông có cảm giác sạch sẽ)"},
            {"word": "開放感", "reading": "かいほうかん", "meaning": "Cảm giác giải phóng, tự do", "han_viet": "KHAI PHÓNG CẢM", "example": "開放感を味わう (Thưởng thức cảm giác rộng rãi, tự do)"}
        ]
    },
    {
        "parent": {"word": "〜性", "reading": "〜せい", "meaning": "〜 TÍNH (Mang tính, chất)", "han_viet": "TÍNH"},
        "children": [
            {"word": "創造性", "reading": "そうぞうせい", "meaning": "Tính sáng tạo", "han_viet": "SÁNG TẠO TÍNH", "example": "創造性を発揮する (Phát huy tính sáng tạo)"},
            {"word": "安全性", "reading": "あんぜんせい", "meaning": "Tính an toàn", "han_viet": "AN TOÀN TÍNH", "example": "安全性を確かめる (Kiểm tra tính an toàn)"},
            {"word": "可能性", "reading": "かのうせい", "meaning": "Tính khả năng", "han_viet": "KHẢ NĂNG TÍNH", "example": "可能性を試す (Thử tính khả năng)"},
            {"word": "植物性", "reading": "しょくぶつせい", "meaning": "Tính chất thực vật", "han_viet": "THỰC VẬT TÍNH", "example": "植物性の油 (Dầu mang tính chất thực vật)"}
        ]
    },
    {
        "parent": {"word": "〜製", "reading": "〜せい", "meaning": "〜 CHẾ (Sản xuất bởi)", "han_viet": "CHẾ"},
        "children": [
            {"word": "スチール製", "reading": "すちーるせい", "meaning": "Cái bàn được làm bằng thép", "han_viet": "CHẾ", "example": "スチール製の机 (Cái bàn làm bằng thép)"},
            {"word": "日本製", "reading": "にほんせい", "meaning": "Sản xuất tại Nhật Bản", "han_viet": "NHẬT BẢN CHẾ", "example": "日本製の商品 (Sản phẩm sản xuất tại Nhật)"}
        ]
    },
    {
        "parent": {"word": "〜金", "reading": "〜きん", "meaning": "〜 KIM (Tiền)", "han_viet": "KIM"},
        "children": [
            {"word": "入学金", "reading": "にゅうがくきん", "meaning": "Phí nhập học", "han_viet": "NHẬP HỌC KIM", "example": "入学金を払う (Trả phí nhập học)"},
            {"word": "税金", "reading": "ぜいきん", "meaning": "Tiền thuế", "han_viet": "THUẾ KIM", "example": "税金を納める (Nộp tiền thuế)"},
            {"word": "年金", "reading": "ねんきん", "meaning": "Tiền lương hưu", "han_viet": "NIÊN KIM", "example": "年金をもらう (Nhận tiền lương hưu)"},
            {"word": "奨学金", "reading": "しょうがくきん", "meaning": "Tiền học bổng", "han_viet": "THƯỞNG HỌC KIM", "example": "奨学金を申請する (Xin học bổng)"},
            {"word": "保証金", "reading": "ほしょうきん", "meaning": "Tiền bảo hiểm, đặt cọc", "han_viet": "BẢO CHỨNG KIM", "example": "保証金を払う (Trả tiền đặt cọc)"}
        ]
    },
    {
        "parent": {"word": "〜料", "reading": "〜りょう", "meaning": "〜 LIỆU (Tiền phí)", "han_viet": "LIỆU"},
        "children": [
            {"word": "授業料", "reading": "じゅぎょうりょう", "meaning": "Tiền học phí", "han_viet": "THỤ NGHIỆP LIỆU", "example": "授業料を納める (Trả tiền học phí)"},
            {"word": "入場料", "reading": "にゅうじょうりょう", "meaning": "Tiền phí vào cửa", "han_viet": "NHẬP TRƯỜNG LIỆU", "example": "入場料を払う (Trả phí vào cửa)"},
            {"word": "保険料", "reading": "ほけんりょう", "meaning": "Tiền phí bảo hiểm", "han_viet": "BẢO HIỂM LIỆU", "example": "保険料を支払う (Nộp phí bảo hiểm)"},
            {"word": "使用料", "reading": "しようりょう", "meaning": "Tiền phí sử dụng", "han_viet": "SỬ DỤNG LIỆU", "example": "使用料を払う (Trả phí sử dụng)"},
            {"word": "バイト料", "reading": "ばいとりょう", "meaning": "Tiền làm thêm", "han_viet": "LIỆU", "example": "バイト料をもらう (Nhận tiền làm thêm)"}
        ]
    },
    {
        "parent": {"word": "〜代", "reading": "〜だい", "meaning": "〜 ĐẠI (Tiền)", "han_viet": "ĐẠI"},
        "children": [
            {"word": "電気代", "reading": "でんきだい", "meaning": "Tiền điện", "han_viet": "ĐIỆN KHÍ ĐẠI", "example": "電気代が高くなる (Tiền điện tăng cao)"},
            {"word": "ガソリン代", "reading": "がそりんだい", "meaning": "Tiền xăng xe", "han_viet": "ĐẠI", "example": "ガソリン代を払う (Trả tiền xăng)"},
            {"word": "修理代", "reading": "しゅうりだい", "meaning": "Tiền sửa chữa", "han_viet": "TU LÝ ĐẠI", "example": "修理代がかかる (Tốn tiền sửa chữa)"},
            {"word": "飲み代", "reading": "のみだい", "meaning": "Tiền uống rượu", "han_viet": "ẨM ĐẠI", "example": "飲み代を割り勘にする (Chia tiền nhậu)"},
            {"word": "バイト代", "reading": "ばいとだい", "meaning": "Tiền làm thêm", "han_viet": "ĐẠI", "example": "バイト代が入る (Tiền làm thêm về)"}
        ]
    },
    {
        "parent": {"word": "〜賃", "reading": "〜ちん", "meaning": "〜 NHẪM (Tiền cước, thuê)", "han_viet": "NHẪM"},
        "children": [
            {"word": "運賃", "reading": "うんちん", "meaning": "Tiền phí vận chuyển", "han_viet": "VẬN NHẪM", "example": "運賃を計算する (Tính phí vận chuyển)"},
            {"word": "乗車賃", "reading": "じょうしゃちん", "meaning": "Tiền phí lên xe", "han_viet": "THỪA XA NHẪM", "example": "乗車賃を払う (Trả tiền cước lên xe)"},
            {"word": "家賃", "reading": "やちん", "meaning": "Tiền thuê nhà", "han_viet": "GIA NHẪM", "example": "毎月家賃を支払う (Hàng tháng trả tiền nhà)"},
            {"word": "借り賃", "reading": "かりちん", "meaning": "Tiền thuê", "han_viet": "TÁ NHẪM", "example": "借り賃を払う (Trả tiền thuê)"},
            {"word": "手間賃", "reading": "てまちん", "meaning": "Tiền phí nhân công", "han_viet": "THỦ GIANG NHẪM", "example": "手間賃を払う (Trả tiền công)"}
        ]
    }
]

words_list = []
curr_id = 1195

for group in PREFIX_SUFFIX_DATA:
    p = group["parent"]
    # Add parent card
    parent_word = {
        "id": curr_id,
        "word": p["word"],
        "reading": p["reading"],
        "han_viet": p["han_viet"],
        "word_type": "Tiền tố / Hậu tố",
        "meaning": p["meaning"],
        "examples": [],
        "sub_section": f"📌 11 Tiền tố - Hậu tố: {p['word']}",
        "is_parent_header": True
    }
    words_list.append(parent_word)
    curr_id += 1

    # Add child cards
    for c in group["children"]:
        ex_obj = []
        if c.get("example"):
            parts = c["example"].split(" (")
            ja_t = parts[0].strip()
            vi_t = parts[1].rstrip(")").strip() if len(parts) > 1 else ""
            ex_obj.append({"ja": ja_t, "reading": "", "vi": vi_t})

        child_word = {
            "id": curr_id,
            "word": c["word"],
            "reading": c["reading"],
            "han_viet": c["han_viet"],
            "word_type": "Từ ghép",
            "meaning": c["meaning"],
            "examples": ex_obj,
            "sub_section": f"📌 11 Tiền tố - Hậu tố: {p['word']}",
            "is_parent_header": False,
            "parent_prefix": p["word"]
        }
        words_list.append(child_word)
        curr_id += 1

# Append prefix-suffix words into lesson_10.json
# Keep non-prefix words from lesson_10, then replace prefix section with structured words_list
non_prefix_words = [w for w in data["words"] if not any(px in w["word"] for px in ['不〜', '無〜', '非〜', '未〜', '再〜', '超〜', '高〜', '〜的', '〜風', '〜感', '〜性', '〜製', '〜金', '〜料', '〜代', '〜賃', '不可能', '不必要', '不愉快', '不健康', '無差別', '無関心', '無頓着', '非常識', '非公式', '非科学的', '未完成', '未解決', '再出発', '再生産', '超満員', '超小型', '高カロリー', '高収入', '代表的', '日常的', '進歩的', '科学的', '政治的', 'サラリーマン風', '関西風', '西洋風', '存在感', '安定感', '清潔感', '開放感', '創造性', '安全性', '可能性', '植物性', 'スチール製', '日本製', '入学金', '税金', '年金', '奨学金', '保証金', '授業料', '入場料', '保険料', '使用料', 'バイト料', '電気代', 'ガソリン代', '修理代', '飲み代', 'バイト代', '運賃', '乗車賃', '家賃', '借り賃', '手間賃'])]

data["words"] = non_prefix_words + words_list

with open(lesson_10_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Successfully formatted Lesson 10 with {len(words_list)} Parent/Child Prefix-Suffix cards.")
