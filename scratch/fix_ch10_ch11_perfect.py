import json
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

# 1. Clean Chapter 10 (Phân biệt từ vựng)
CHAPTER_10_WORDS = [
    # 10.1
    {
        "word": "あっさり",
        "reading": "あっさり",
        "han_viet": "",
        "word_type": "Trạng từ / Từ láy",
        "meaning": "Nhạt, thanh (vị) / Đơn giản, chóng vánh",
        "sub_section": "10.1 Phân biệt Từ láy / Trạng từ",
        "examples": [
            {"ja": "あっさりした味", "reading": "あっさりしたあじ", "vi": "Vị nhạt, thanh"},
            {"ja": "問題をあっさり解決した。", "reading": "もんだいをあっさりかいけつした。", "vi": "Giải quyết vấn đề một cách đơn giản."}
        ]
    },
    {
        "word": "さっぱり",
        "reading": "さっぱり",
        "han_viet": "",
        "word_type": "Trạng từ / Từ láy",
        "meaning": "Nhạt, thanh (vị) / Hoàn toàn / Thoải mái",
        "sub_section": "10.1 Phân biệt Từ láy / Trạng từ",
        "examples": [
            {"ja": "さっぱりした味", "reading": "さっぱりしたあじ", "vi": "Vị nhạt, thanh"},
            {"ja": "さっぱり忘れた。", "reading": "さっぱりわすれた。", "vi": "Đã quên hoàn toàn."}
        ]
    },
    # 10.2
    {
        "word": "犯す",
        "reading": "おかす",
        "han_viet": "PHẠM",
        "word_type": "Động từ",
        "meaning": "Vi phạm luật định, luật pháp, luân thường đạo lý",
        "sub_section": "10.2 Phân biệt 犯す / 侵す / 冒す",
        "examples": [
            {"ja": "過ちを犯した。", "reading": "あやまちをおかした。", "vi": "Phạm lỗi, mắc lỗi."},
            {"ja": "罪を犯す。", "reading": "つみをおかす。", "vi": "Phạm tội."}
        ]
    },
    {
        "word": "侵す",
        "reading": "おかす",
        "han_viet": "XÂM",
        "word_type": "Động từ",
        "meaning": "Xâm phạm vào thứ của người khác",
        "sub_section": "10.2 Phân biệt 犯す / 侵す / 冒す",
        "examples": [
            {"ja": "領海を侵す。", "reading": "りょうかいをおかす。", "vi": "Xâm phạm lãnh hải."},
            {"ja": "プライバシーを侵す。", "reading": "ぷらいばしーをおかす。", "vi": "Xâm phạm quyền riêng tư."}
        ]
    },
    {
        "word": "冒す",
        "reading": "おかす",
        "han_viet": "MẠO",
        "word_type": "Động từ",
        "meaning": "Đương đầu / Ảnh hưởng / Mạo phạm",
        "sub_section": "10.2 Phân biệt 犯す / 侵す / 冒す",
        "examples": [
            {"ja": "危険を冒す。", "reading": "きけんをおかす。", "vi": "Đương đầu với hiểm nguy."},
            {"ja": "尊厳を冒す。", "reading": "そんげんをおかす。", "vi": "Mạo phạm lòng tự trọng."}
        ]
    },
    # 10.3
    {
        "word": "治める・治まる",
        "reading": "おさめる・おさまる",
        "han_viet": "TRỊ",
        "word_type": "Động từ",
        "meaning": "Trị vì, cai trị / Làm cho ổn định / Được cải thiện",
        "sub_section": "10.3 Phân biệt 治める / 修める / 収める / 納める",
        "examples": [
            {"ja": "国を治める。", "reading": "くにをおさめる。", "vi": "Trị vì đất nước."},
            {"ja": "痛みが治まった。", "reading": "いたみがおさまった。", "vi": "Đỡ đau."}
        ]
    },
    {
        "word": "修める・修まる",
        "reading": "おさめる・おさまる",
        "han_viet": "TU",
        "word_type": "Động từ",
        "meaning": "Trau dồi tu luyện / Bản thân được trau dồi",
        "sub_section": "10.3 Phân biệt 治める / 修める / 収める / 納める",
        "examples": [
            {"ja": "語学を修める。", "reading": "ごがくをおさめる。", "vi": "Trau dồi ngôn ngữ."},
            {"ja": "身を修める。", "reading": "みをおさめる。", "vi": "Trau dồi bản thân."}
        ]
    },
    {
        "word": "収める・収まる",
        "reading": "おさめる・おさまる",
        "han_viet": "THU",
        "word_type": "Động từ",
        "meaning": "Cất đi / Thu được / Vừa vặn / Trở nên ổn",
        "sub_section": "10.3 Phân biệt 治める / 修める / 収める / 納める",
        "examples": [
            {"ja": "リンゴを箱に収める。", "reading": "りんごをはこにおさめる。", "vi": "Cất táo vào hộp."},
            {"ja": "成功を収める。", "reading": "せいこうをおさめる。", "vi": "Gặt hái thành công."}
        ]
    },
    {
        "word": "納める・納まる",
        "reading": "おさめる・おさまる",
        "han_viet": "NẠP",
        "word_type": "Động từ",
        "meaning": "Nộp, đóng / Nhận chức (Phù hợp)",
        "sub_section": "10.3 Phân biệt 治める / 修める / 収める / 納める",
        "examples": [
            {"ja": "税金を納める。", "reading": "ぜいきんをおさめる。", "vi": "Nộp thuế."},
            {"ja": "社長に納まる。", "reading": "しゃちょうにおさまる。", "vi": "Nhận chức giám đốc."}
        ]
    },
    # 10.4
    {
        "word": "及ぼす",
        "reading": "およぼす",
        "han_viet": "CẬP",
        "word_type": "Động từ",
        "meaning": "Gây ra (ảnh hưởng, phiền phức)",
        "sub_section": "10.4 Phân biệt 及ぼす / 及ぶ",
        "examples": [
            {"ja": "影響を及ぼす。", "reading": "えいきょうをおよぼす。", "vi": "Gây ảnh hưởng."},
            {"ja": "迷惑を及ぼす。", "reading": "めいわくをおよぼす。", "vi": "Gây phiền toái."}
        ]
    },
    {
        "word": "及ぶ",
        "reading": "およぶ",
        "han_viet": "CẬP",
        "word_type": "Động từ",
        "meaning": "Kéo dài / Đạt đến / Ngang tầm / Cần thiết",
        "sub_section": "10.4 Phân biệt 及ぼす / 及ぶ",
        "examples": [
            {"ja": "２時間に及ぶ討論", "reading": "にじかんにおよぶとうろん", "vi": "Cuộc tranh luận kéo dài 2 tiếng"},
            {"ja": "心配するには及ばない。", "reading": "しんぱいするにはおよばない。", "vi": "Không cần lo lắng đâu."}
        ]
    },
    # 10.5
    {
        "word": "発達",
        "reading": "はったつ",
        "han_viet": "PHÁT ĐẠT",
        "word_type": "Danh từ / Động từ",
        "meaning": "Phát triển (về tâm hồn, thể chất, năng lực, hiện tượng tự nhiên)",
        "sub_section": "10.5 Phân biệt 発達 / 発展",
        "examples": [
            {"ja": "子どもの身体が発達する。", "reading": "こどものしんたいがはったつする。", "vi": "Cơ thể của trẻ phát triển."},
            {"ja": "台風が発達する。", "reading": "たいふうがはったつする。", "vi": "Bão ngày càng mạnh lên."}
        ]
    },
    {
        "word": "発展",
        "reading": "はってん",
        "han_viet": "PHÁT TRIỂN",
        "word_type": "Danh từ / Động từ",
        "meaning": "Phát triển (về quy mô, lĩnh vực, lãnh thổ, sức mạnh)",
        "sub_section": "10.5 Phân biệt 発達 / 発展",
        "examples": [
            {"ja": "ベトナムの経済が発展している。", "reading": "べとなむのけいざいがはってんしている。", "vi": "Nền kinh tế của Việt Nam đang phát triển."}
        ]
    },
    # 10.6
    {
        "word": "内容",
        "reading": "ないよう",
        "han_viet": "NỘI DUNG",
        "word_type": "Danh từ",
        "meaning": "Nội dung (cuộc nói chuyện, cuộc họp, bài giảng, sách...)",
        "sub_section": "10.6 Phân biệt 内容 / 中身",
        "examples": [
            {"ja": "この教科書の内容は分かりやすい。", "reading": "このきょうかしょのないようはわかりやすい。", "vi": "Nội dung của quyển sách này dễ hiểu."}
        ]
    },
    {
        "word": "中身",
        "reading": "なかみ",
        "han_viet": "TRUNG THÂN",
        "word_type": "Danh từ",
        "meaning": "Nội dung (nội tâm, bên trong, đồ bên trong)",
        "sub_section": "10.6 Phân biệt 内容 / 中身",
        "examples": [
            {"ja": "箱の中身は何ですか。", "reading": "<ctrl42>はこのなかみはなんですか。", "vi": "Bên trong cái hộp là gì vậy?"}
        ]
    },
    # 10.7
    {
        "word": "値段",
        "reading": "ねだん",
        "han_viet": "TRỊ ĐOẠN",
        "word_type": "Danh từ",
        "meaning": "Giá cả, giá tiền (dùng trong văn nói)",
        "sub_section": "10.7 Phân biệt 値段 / 価格",
        "examples": [
            {"ja": "洋服の値段が安くなっていた。", "reading": "ようふくのねだんがやすくなっていた。", "vi": "Quần áo giá đã rẻ hơn rồi."}
        ]
    },
    {
        "word": "価格",
        "reading": "かかく",
        "han_viet": "GIÁ CÁCH",
        "word_type": "Danh từ",
        "meaning": "Giá cả, giá tiền (dùng trong văn viết)",
        "sub_section": "10.7 Phân biệt 値段 / 価格",
        "examples": [
            {"ja": "野菜の価格が高騰している。", "reading": "やさいのかかくがこうとうしている。", "vi": "Giá rau đang tăng vọt."}
        ]
    },
    # 10.8
    {
        "word": "楽",
        "reading": "らく",
        "han_viet": "LẠC",
        "word_type": "Tính từ な",
        "meaning": "Đơn giản, thoải mái, tiện lợi, dễ chịu",
        "sub_section": "10.8 Phân biệt 楽 / 気楽",
        "examples": [
            {"ja": "楽な生活", "reading": "らくなせいかつ", "vi": "Cuộc sống thoải mái."},
            {"ja": "今日の宿題は楽に終わらせた。", "reading": "きょうのしゅくだいはらくにおわらせた。", "vi": "Bài tập hôm nay mình hoàn thành dễ dàng."}
        ]
    },
    {
        "word": "気楽",
        "reading": "きらく",
        "han_viet": "KHÍ LẠC",
        "word_type": "Tính từ な",
        "meaning": "Thoải mái, dễ chịu, thanh thản",
        "sub_section": "10.8 Phân biệt 楽 / 気楽",
        "examples": [
            {"ja": "気楽に考えればいいよ。", "reading": "きらくにかんがえればいいよ。", "vi": "Suy nghĩ thoải mái cũng được."},
            {"ja": "一人暮らしは気楽だ。", "reading": "ひとりぐらしはきらくだ。", "vi": "Sống một mình thật thoải mái."}
        ]
    },
    # 10.9
    {
        "word": "利益",
        "reading": "りえき",
        "han_viet": "LỢI ÍCH",
        "word_type": "Danh từ",
        "meaning": "Lợi nhuận",
        "sub_section": "10.9 Phân biệt 利益 / 収益",
        "examples": [
            {"ja": "会社の利益は右肩上がりだ。", "reading": "かいしゃのりえきはみぎかたあがりだ。", "vi": "Lợi nhuận của công ty đang tăng lên."}
        ]
    },
    {
        "word": "収益",
        "reading": "しゅうえき",
        "han_viet": "THU ÍCH",
        "word_type": "Danh từ",
        "meaning": "Tổng doanh thu",
        "sub_section": "10.9 Phân biệt 利益 / 収益",
        "examples": [
            {"ja": "ユーチューブで収益を得る。", "reading": "ゆーちゅーぶでしゅうえきをえる。", "vi": "Đạt được doanh thu từ YouTube."}
        ]
    }
]

# 2. Clean Chapter 11 Parent Cards & Children with Grammar Equivalent (NGỮ PHÁP TƯƠNG ĐƯƠNG)
CHAPTER_11_GROUPS = [
    # --- TIỀN TỐ (PREFIXES) ---
    {
        "parent": {
            "word": "不〜",
            "reading": "ふ〜",
            "han_viet": "BẤT",
            "grammar_equiv": "〜ではない",
            "meaning": "BẤT 〜 (Không)",
            "word_type": "TIỀN TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "不可能（な）", "reading": "ふかのう", "han_viet": "BẤT KHẢ NĂNG", "meaning": "Không thể nào", "examples": [{"ja": "３ヶ月でN1を取るのは不可能だ。", "reading": "さんかげつでエヌいちをとるのはふかのうだ。", "vi": "Việc lấy N1 trong 3 tháng là điều không thể."}]},
            {"word": "不必要（な）", "reading": "ふひつよう", "han_viet": "BẤT TẤT YẾU", "meaning": "Không cần thiết", "examples": [{"ja": "不必要な外出はおやめください。", "reading": "ふひつようながいしゅつはおやめください。", "vi": "Vui lòng hạn chế ra ngoài khi không cần thiết."}]},
            {"word": "不愉快（な）", "reading": "ふゆかい", "han_viet": "BẤT DU KHOÁI", "meaning": "Không thoải mái, khó chịu", "examples": [{"ja": "不愉快なコメント", "reading": "ふゆかいなこめんと", "vi": "Những bình luận khó chịu"}]},
            {"word": "不健康（な）", "reading": "ふけんこう", "han_viet": "BẤT KIỆN KHANG", "meaning": "Không khoẻ, không tốt cho sức khoẻ", "examples": [{"ja": "不健康な食生活", "reading": "ふけんこうなしょくせいかつ", "vi": "Thói quen ăn uống không tốt cho sức khỏe"}]}
        ]
    },
    {
        "parent": {
            "word": "無〜",
            "reading": "む〜",
            "han_viet": "VÔ",
            "grammar_equiv": "〜がない",
            "meaning": "VÔ 〜 (Không có)",
            "word_type": "TIỀN TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "無差別", "reading": "むさべつ", "han_viet": "VÔ SAI BIỆT", "meaning": "Không phân biệt, bừa bãi", "examples": [{"ja": "無差別殺人事件", "reading": "むさべつさつじんじけん", "vi": "Vụ án giết người bừa bãi"}]},
            {"word": "無関係（な）", "reading": "むかんけい", "han_viet": "VÔ QUAN HỆ", "meaning": "Không liên quan", "examples": [{"ja": "無関係な話", "reading": "むかんけいなはなし", "vi": "Những câu chuyện không liên quan"}]},
            {"word": "無関心（な）", "reading": "むかんしん", "han_viet": "VÔ QUAN TÂM", "meaning": "Không quan tâm", "examples": [{"ja": "政治に無関心な若者", "reading": "せいじにむかんしんなわかもの", "vi": "Những người trẻ mà không quan tâm đến chính trị"}]},
            {"word": "無頓着", "reading": "むとんちゃく", "han_viet": "VÔ ĐỒN TRƯỚC", "meaning": "Không để ý, bừa bãi", "examples": [{"ja": "身なりに無頓着だ", "reading": "みなりにむとんちゃくだ", "vi": "Không để ý đến diện mạo"}]}
        ]
    },
    {
        "parent": {
            "word": "非〜",
            "reading": "ひ〜",
            "han_viet": "PHI",
            "grammar_equiv": "〜ではない",
            "meaning": "PHI 〜 (Không, trái với)",
            "word_type": "TIỀN TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "非常識", "reading": "ひじょうしき", "han_viet": "PHI THƯỜNG THỨC", "meaning": "Thiếu ý thức, thiếu thường thức", "examples": [{"ja": "非常識な言動", "reading": "ひじょうしきなげんどう", "vi": "Những lời nói và hành động vô ý thức"}]},
            {"word": "非公式", "reading": "ひこうしき", "han_viet": "PHI CÔNG THỨC", "meaning": "Không chính thức", "examples": [{"ja": "非公式の発表", "reading": "ひこうしきのはっぴょう", "vi": "Phát biểu không chính thức"}]},
            {"word": "非科学的", "reading": "ひかがくてき", "han_viet": "PHI KHOA HỌC ĐÍCH", "meaning": "Không khoa học (phản khoa học)", "examples": [{"ja": "非科学的な考え", "reading": "ひかがくてきなかんがえ", "vi": "Suy nghĩ phản khoa học"}]}
        ]
    },
    {
        "parent": {
            "word": "未〜",
            "reading": "み〜",
            "han_viet": "VỊ",
            "grammar_equiv": "〜まだ",
            "meaning": "VỊ 〜 (Chưa)",
            "word_type": "TIỀN TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "未完成", "reading": "みかんせい", "han_viet": "VỊ HOÀN THÀNH", "meaning": "Chưa hoàn thành", "examples": [{"ja": "未完成の作品", "reading": "みかんせいのさくひん", "vi": "Tác phẩm chưa hoàn thành"}]},
            {"word": "未解決", "reading": "みかいけつ", "han_viet": "VỊ GIẢI QUYẾT", "meaning": "Chưa giải quyết", "examples": [{"ja": "未解決の問題", "reading": "みかいけつのもんだい", "vi": "Vấn đề chưa được giải quyết"}]},
            {"word": "未経験", "reading": "みけいけん", "han_viet": "VỊ KINH NGHIỆM", "meaning": "Chưa có kinh nghiệm", "examples": [{"ja": "未経験者歓迎", "reading": "みけいけんしゃかんげい", "vi": "Chào đón người chưa có kinh nghiệm"}]}
        ]
    },
    {
        "parent": {
            "word": "再〜",
            "reading": "さい〜",
            "han_viet": "TÁI",
            "grammar_equiv": "〜もう一度",
            "meaning": "TÁI 〜 (Lại, làm lại)",
            "word_type": "TIỀN TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "再出発（する）", "reading": "さいしゅっぱつ", "han_viet": "TÁI XUẤT PHÁT", "meaning": "Khởi đầu lại", "examples": [{"ja": "新しい土地で再出発する。", "reading": "あたらしいとちでさいしゅっぱつする。", "vi": "Tôi khởi đầu lại trên vùng đất mới."}]},
            {"word": "再生産（する）", "reading": "さいせいさん", "han_viet": "TÁI SẢN XUẤT", "meaning": "Tái sản xuất", "examples": [{"ja": "同じ規模で再生産する", "reading": "おなじきぼでさいせいさんする", "vi": "Tái sản xuất theo quy mô giống như cũ."}]},
            {"word": "再認識（する）", "reading": "さいにんしき", "han_viet": "TÁI NHẬN THỨC", "meaning": "Nhận thức lại", "examples": [{"ja": "重大性を再認識する", "reading": "じゅうだいせいをさいにんしきする", "vi": "Nhận ra sự nghiêm trọng của vấn đề."}]},
            {"word": "再開発", "reading": "さいかいはつ", "han_viet": "TÁI KHAI PHÁT", "meaning": "Quy hoạch tái phát triển", "examples": [{"ja": "駅前の再開発", "reading": "えきまえのさいかいはつ", "vi": "Tái phát triển khu vực trước ga."}]}
        ]
    },
    {
        "parent": {
            "word": "超〜",
            "reading": "ちょう〜",
            "han_viet": "SIÊU",
            "grammar_equiv": "〜すごく",
            "meaning": "SIÊU 〜 (Quá, vượt mức)",
            "word_type": "TIỀN TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "超満員", "reading": "ちょうまんいん", "han_viet": "SIÊU MÃN VIÊN", "meaning": "Quá đông người (chật cứng người)", "examples": [{"ja": "超満員の電車", "reading": "ちょうまんいんのでんしゃ", "vi": "Xe điện chật cứng người"}]},
            {"word": "超小型", "reading": "ちょうこがた", "han_viet": "SIÊU TIỂU HÌNH", "meaning": "Cỡ siêu nhỏ", "examples": [{"ja": "超小型カメラ", "reading": "ちょうこがたかめら", "vi": "Camera siêu nhỏ"}]},
            {"word": "超特急", "reading": "ちょうとっきゅう", "han_viet": "SIÊU ĐẶC CẤP", "meaning": "Tàu siêu tốc", "examples": [{"ja": "超特急で進める", "reading": "ちょうとっきゅうですすめる", "vi": "Tiến hành với tốc độ siêu nhanh"}]}
        ]
    },
    {
        "parent": {
            "word": "高〜",
            "reading": "こう〜",
            "han_viet": "CAO",
            "grammar_equiv": "〜高い",
            "meaning": "CAO 〜 (Cao, nhiều)",
            "word_type": "TIỀN TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "高カロリー", "reading": "こうかろりー", "han_viet": "CAO", "meaning": "Hàm lượng Calo cao", "examples": [{"ja": "高カロリーの食品", "reading": "こうかろりーのしょくひん", "vi": "Thực phẩm hàm lượng calo cao"}]},
            {"word": "高収入", "reading": "こうしゅうにゅう", "han_viet": "CAO THU NHẬP", "meaning": "Thu nhập cao", "examples": [{"ja": "高収入の仕事", "reading": "こうしゅうにゅうのしごと", "vi": "Công việc thu nhập cao"}]},
            {"word": "高気圧", "reading": "こうきあつ", "han_viet": "CAO KHÍ ÁP", "meaning": "Áp suất cao", "examples": [{"ja": "高気圧に覆われる", "reading": "こうきあつにおおわれる", "vi": "Bao phủ bởi áp suất cao"}]}
        ]
    },
    {
        "parent": {
            "word": "低〜",
            "reading": "てい〜",
            "han_viet": "ĐÊ",
            "grammar_equiv": "〜低い",
            "meaning": "ĐÊ 〜 (Thấp)",
            "word_type": "TIỀN TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "低気圧", "reading": "ていきあつ", "han_viet": "ĐÊ KHÍ ÁP", "meaning": "Áp suất thấp", "examples": [{"ja": "低気圧が近づく", "reading": "ていきあつがちかづく", "vi": "Áp suất thấp đang đến gần"}]},
            {"word": "低カロリー", "reading": "ていかろりー", "han_viet": "ĐÊ", "meaning": "Lượng calo thấp", "examples": [{"ja": "低カロリーの食事", "reading": "ていかろりーのしょくじ", "vi": "Bữa ăn calo thấp"}]},
            {"word": "低価格", "reading": "ていかかく", "han_viet": "ĐÊ GIÁ CÁCH", "meaning": "Giá thấp, giá rẻ", "examples": [{"ja": "低価格で提供する", "reading": "ていかかくでていきょうする", "vi": "Cung cấp với giá thấp"}]}
        ]
    },
    {
        "parent": {
            "word": "好〜",
            "reading": "こう〜",
            "han_viet": "HẢO",
            "grammar_equiv": "〜いい",
            "meaning": "HẢO 〜 (Tốt, thuận lợi)",
            "word_type": "TIỀN TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "好条件", "reading": "こうじょうけん", "han_viet": "HẢO ĐIỀU KIỆN", "meaning": "Điều kiện tốt", "examples": [{"ja": "好条件で働く", "reading": "こうじょうけんではたらく", "vi": "Làm việc với điều kiện tốt"}]},
            {"word": "好成績", "reading": "こうせいせき", "han_viet": "HẢO THÀNH TÍCH", "meaning": "Thành tích tốt", "examples": [{"ja": "好成績を収める", "reading": "こうせいせきをおさめる", "vi": "Đạt được thành tích tốt"}]},
            {"word": "好景気", "reading": "こうけいき", "han_viet": "HẢO CẢNH KHÍ", "meaning": "Nền kinh tế tốt", "examples": [{"ja": "好景気が続く", "reading": "こうけいきがつづく", "vi": "Nền kinh tế tốt tiếp diễn"}]}
        ]
    },
    {
        "parent": {
            "word": "悪〜",
            "reading": "あく〜",
            "han_viet": "ÁC",
            "grammar_equiv": "〜悪い",
            "meaning": "ÁC 〜 (Xấu, không tốt)",
            "word_type": "TIỀN TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "悪条件", "reading": "あくじょうけん", "han_viet": "ÁC ĐIỀU KIỆN", "meaning": "Điều kiện xấu", "examples": [{"ja": "悪条件が重なる", "reading": "あくじょうけんがかさなる", "vi": "Nhiều điều kiện bất lợi chồng chất"}]},
            {"word": "悪趣味", "reading": "あくしゅみ", "han_viet": "ÁC TÚ VỊ", "meaning": "Sở thích xấu, kì dị", "examples": [{"ja": "悪趣味なデザイン", "reading": "あくしゅみなでざいん", "vi": "Thiết kế sở thích kì dị"}]},
            {"word": "悪影響", "reading": "あくえいきょう", "han_viet": "ÁC ẢNH HƯỞNG", "meaning": "Ảnh hưởng xấu", "examples": [{"ja": "悪影響を与える", "reading": "あくえいきょうをあたえる", "vi": "Gây ra ảnh hưởng xấu"}]}
        ]
    },
    {
        "parent": {
            "word": "初〜",
            "reading": "しょ〜",
            "han_viet": "SƠ",
            "grammar_equiv": "〜はじめて",
            "meaning": "SƠ 〜 (Lần đầu tiên)",
            "word_type": "TIỀN TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "初登場", "reading": "はつとうじょう", "han_viet": "SƠ ĐỔNG TRƯỜNG", "meaning": "Lần đầu xuất hiện", "examples": [{"ja": "初登場のキャラクター", "reading": "はつとうじょうのきゃらくたー", "vi": "Nhân vật lần đầu xuất hiện"}]},
            {"word": "初体験", "reading": "はつたいけん", "han_viet": "SƠ THỂ NGHIỆM", "meaning": "Trải nghiệm lần đầu", "examples": [{"ja": "初体験の連続", "reading": "はつたいけんのれんぞく", "vi": "Chuỗi trải nghiệm lần đầu"}]},
            {"word": "初優勝", "reading": "はつゆうしょう", "han_viet": "SƠ ƯU THẮNG", "meaning": "Vô địch lần đầu", "examples": [{"ja": "初優勝を果たす", "reading": "はつゆうしょうをはたす", "vi": "Giành chức vô địch lần đầu tiên"}]}
        ]
    },
    {
        "parent": {
            "word": "各〜",
            "reading": "かく〜",
            "han_viet": "CÁC",
            "grammar_equiv": "〜それぞれの",
            "meaning": "CÁC 〜 (Mỗi, từng)",
            "word_type": "TIỀN TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "各クラス", "reading": "かくくらす", "han_viet": "CÁC", "meaning": "Các lớp, từng lớp", "examples": [{"ja": "各クラスのリーダー", "reading": "かくくらすのりーだー", "vi": "Người đứng đầu của từng lớp"}]},
            {"word": "各家庭", "reading": "かくかてい", "han_viet": "CÁC GIA ĐÌNH", "meaning": "Mỗi gia đình", "examples": [{"ja": "各家庭に配る", "reading": "かくかていにくばる", "vi": "Phát đến từng gia đình"}]}
        ]
    },
    {
        "parent": {
            "word": "長〜",
            "reading": "ちょう〜",
            "han_viet": "TRƯỜNG",
            "grammar_equiv": "〜長い",
            "meaning": "TRƯỜNG 〜 (Dài)",
            "word_type": "TIỀN TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "長持ち", "reading": "ながもち", "han_viet": "TRƯỜNG TRÌ", "meaning": "Bền, giữ được lâu", "examples": [{"ja": "長持ちする靴", "reading": "ながもちするくつ", "vi": "Đôi giày đi rất bền"}]},
            {"word": "長話", "reading": "ながばなし", "han_viet": "TRƯỜNG THOẠI", "meaning": "Câu chuyện dài dòng", "examples": [{"ja": "長話になる", "reading": "ながばなしになる", "vi": "Trở thành cuộc nói chuyện dài dòng"}]}
        ]
    },
    {
        "parent": {
            "word": "副〜",
            "reading": "ふく〜",
            "han_viet": "PHÓ",
            "grammar_equiv": "〜サブ",
            "meaning": "PHÓ 〜 (Phụ, phó)",
            "word_type": "TIỀN TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "副社長", "reading": "ふくしゃちょう", "han_viet": "PHÓ XÃ TRƯỜNG", "meaning": "Phó giám đốc", "examples": [{"ja": "副社長に就任する", "reading": "ふくしゃちょうにしゅうにんする", "vi": "Nhiệm chức phó giám đốc"}]},
            {"word": "副作用", "reading": "ふくさよう", "han_viet": "PHÓ TÁC DỤNG", "meaning": "Tác dụng phụ", "examples": [{"ja": "薬の副作用", "reading": "くすりのふくさよう", "vi": "Tác dụng phụ của thuốc"}]}
        ]
    },
    {
        "parent": {
            "word": "名〜",
            "reading": "めい〜",
            "han_viet": "DANH",
            "grammar_equiv": "〜有名な",
            "meaning": "DANH 〜 (Nổi tiếng, ấn tượng)",
            "word_type": "TIỀN TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "名場面", "reading": "めいばめん", "han_viet": "DANH TRƯỜNG DIỆN", "meaning": "Phân đoạn nổi tiếng", "examples": [{"ja": "映画の名場面", "reading": "えいがのめいばめん", "vi": "Cảnh quay ấn tượng của bộ phim"}]},
            {"word": "名演奏", "reading": "めいえんそう", "han_viet": "DANH DIỄN TẤU", "meaning": "Màn biểu diễn ấn tượng", "examples": [{"ja": "素晴らしい名演奏", "reading": "すばらしいめいえんそう", "vi": "Màn trình diễn tuyệt vời"}]},
            {"word": "名女優", "reading": "めいじょゆう", "han_viet": "DANH NỮ ƯU", "meaning": "Nữ diễn viên nổi tiếng", "examples": [{"ja": "名女優として活躍する", "reading": "めいじょゆうとしてかつやくする", "vi": "Hoạt động xuất sắc với vai trò nữ diễn viên nổi tiếng"}]}
        ]
    },
    {
        "parent": {
            "word": "全〜",
            "reading": "ぜん〜",
            "han_viet": "TOÀN",
            "grammar_equiv": "〜すべての",
            "meaning": "TOÀN 〜 (Tất cả, toàn bộ)",
            "word_type": "TIỀN TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "全責任", "reading": "ぜんせきにん", "han_viet": "TOÀN TRÁCH NHIỆM", "meaning": "Toàn bộ trách nhiệm", "examples": [{"ja": "全責任を負う", "reading": "ぜんせきにんをおう", "vi": "Gánh vác toàn bộ trách nhiệm"}]},
            {"word": "全世界", "reading": "ぜんせかい", "han_viet": "TOÀN THẾ GIỚI", "meaning": "Toàn thế giới", "examples": [{"ja": "全世界に広がる", "reading": "ぜんせかいにひろがる", "vi": "Lan rộng ra toàn thế giới"}]}
        ]
    },
    {
        "parent": {
            "word": "総〜",
            "reading": "そう〜",
            "han_viet": "TỔNG",
            "grammar_equiv": "〜ぜんぶ",
            "meaning": "TỔNG 〜 (Tất cả, tổng)",
            "word_type": "TIỀN TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "総人数", "reading": "そうにんずう", "han_viet": "TỔNG NHÂN SỐ", "meaning": "Tổng số người", "examples": [{"ja": "参加者の総人数", "reading": "さんかしゃのそうにんずう", "vi": "Tổng số người tham gia"}]},
            {"word": "総額", "reading": "そうがく", "han_viet": "TỔNG NGẠCH", "meaning": "Tổng số tiền", "examples": [{"ja": "総額10万円", "reading": "そうがくじゅうまんえん", "vi": "Tổng số tiền 10万 yên"}]}
        ]
    },
    {
        "parent": {
            "word": "現〜",
            "reading": "げん〜",
            "han_viet": "HIỆN",
            "grammar_equiv": "〜いま",
            "meaning": "HIỆN 〜 (Hiện tại)",
            "word_type": "TIỀN TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "現社長", "reading": "げんしゃちょう", "han_viet": "HIỆN XÃ TRƯỜNG", "meaning": "Giám đốc hiện tại", "examples": [{"ja": "現社長の挨拶", "reading": "げんしゃちょうのあいさつ", "vi": "Lời chào của giám đốc hiện tại"}]},
            {"word": "現大臣", "reading": "げんだいじん", "han_viet": "HIỆN ĐẠI THẦN", "meaning": "Bộ trưởng hiện tại", "examples": [{"ja": "現大臣の発言", "reading": "げんだいじんのはつげん", "vi": "Phát ngôn của bộ trưởng hiện tại"}]}
        ]
    },
    {
        "parent": {
            "word": "前〜",
            "reading": "ぜん〜",
            "han_viet": "TIỀN",
            "grammar_equiv": "〜すぐ前の",
            "meaning": "TIỀN 〜 (Tiền nhiệm, trước)",
            "word_type": "TIỀN TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "前社長", "reading": "ぜんしゃちょう", "han_viet": "TIỀN XÃ TRƯỜNG", "meaning": "Giám đốc tiền nhiệm", "examples": [{"ja": "前社長の計画", "reading": "ぜんしゃちょうのけいかく", "vi": "Kế hoạch của giám đốc tiền nhiệm"}]},
            {"word": "前大臣", "reading": "まえだいじん", "han_viet": "TIỀN ĐẠI THẦN", "meaning": "Bộ trưởng tiền nhiệm", "examples": [{"ja": "前大臣の功績", "reading": "まえだいじんのこうせき", "vi": "Công trạng của bộ trưởng tiền nhiệm"}]}
        ]
    },

    # --- HẬU TỐ (SUFFIXES) ---
    {
        "parent": {
            "word": "内",
            "reading": "ない",
            "han_viet": "NỘI",
            "grammar_equiv": "〜中",
            "meaning": "NỘI 〜 (Trong, nội)",
            "word_type": "HẬU TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "時間内", "reading": "じかんない", "han_viet": "THỜI GIAN NỘI", "meaning": "Trong thời gian cho phép", "examples": [{"ja": "時間内に書き終える", "reading": "じかんないにかきおえる", "vi": "Viết hết trong thời gian cho phép"}]},
            {"word": "期間内", "reading": "きかんない", "han_viet": "KỲ GIAN NỘI", "meaning": "Trong thời hạn", "examples": [{"ja": "期間内に支払う", "reading": "きかんないにしはらう", "vi": "Trả trong thời gian cho phép"}]},
            {"word": "予算内", "reading": "よさんない", "han_viet": "DỰ TOÁN NỘI", "meaning": "Trong ngân sách", "examples": [{"ja": "予算内に収まる", "reading": "よさんないにおさまる", "vi": "Nằm trong ngân sách dự toán"}]}
        ]
    },
    {
        "parent": {
            "word": "外",
            "reading": "がい",
            "han_viet": "NGOẠI",
            "grammar_equiv": "〜外",
            "meaning": "NGOẠI 〜 (Ngoài, ngoại)",
            "word_type": "HẬU TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "時間外", "reading": "じかんがい", "han_viet": "THỜI GIAN NGOẠI", "meaning": "Ngoài giờ làm việc", "examples": [{"ja": "時間外労働", "reading": "じかんがいろうどう", "vi": "Làm việc ngoài giờ"}]},
            {"word": "範囲外", "reading": "はんいがい", "han_viet": "PHẠM VI NGOẠI", "meaning": "Ngoài phạm vi", "examples": [{"ja": "範囲外の問題", "reading": "はんいがいのもんだい", "vi": "Câu hỏi ngoài phạm vi"}]}
        ]
    },
    {
        "parent": {
            "word": "化",
            "reading": "か",
            "han_viet": "HÓA",
            "grammar_equiv": "〜になる",
            "meaning": "HÓA 〜 (Biến đổi thành)",
            "word_type": "HẬU TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "自動化", "reading": "じどうか", "han_viet": "TỰ ĐỘNG HÓA", "meaning": "Tự động hóa", "examples": [{"ja": "工場を自動化する", "reading": "こうじょうをじどうかする", "vi": "Tự động hóa nhà máy"}]},
            {"word": "高齢化", "reading": "こうれいか", "han_viet": "CAO TUỔI HÓA", "meaning": "Già hóa", "examples": [{"ja": "高齢化問題", "reading": "こうれいかもんだい", "vi": "Vấn đề già hóa dân số"}]},
            {"word": "温暖化", "reading": "おんだんか", "han_viet": "ÔN NÕAN HÓA", "meaning": "Nóng lên (toàn cầu)", "examples": [{"ja": "地球温暖化", "reading": "ちきゅうおんだんか", "vi": "Hiện tượng nóng lên toàn cầu"}]}
        ]
    },
    {
        "parent": {
            "word": "目",
            "reading": "め",
            "han_viet": "MỤC",
            "grammar_equiv": "〜め",
            "meaning": "MỤC 〜 (Mức độ, thứ)",
            "word_type": "HẬU TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "一番目", "reading": "いちばんめ", "han_viet": "NHẤT PHIÊN MỤC", "meaning": "Thứ nhất", "examples": [{"ja": "一番目のコース", "reading": "いちばんめのこーす", "vi": "Lộ trình thứ nhất"}]},
            {"word": "二番目", "reading": "にばんめ", "han_viet": "NHỊ PHIÊN MỤC", "meaning": "Thứ hai", "examples": [{"ja": "二番目の角", "reading": "にばんめのかど", "vi": "Góc rẽ thứ hai"}]},
            {"word": "少な目", "reading": "すくなめ", "han_viet": "THIỂU MỤC", "meaning": "Một ít, hơi ít", "examples": [{"ja": "ごはん少な目にお願いします。", "reading": "ごはんすくなめにおねがいします。", "vi": "Hãy cho tôi ít cơm thôi"}]},
            {"word": "高め", "reading": "たかめ", "han_viet": "CAO MỤC", "meaning": "Cao một chút", "examples": [{"ja": "高めに設定した価格", "reading": "たかめにせっていしたかかく", "vi": "Mức giá đã được thiết lập cao một chút"}]},
            {"word": "変わり目", "reading": "かわりめ", "han_viet": "BIẾN MỤC", "meaning": "Thời điểm thay đổi", "examples": [{"ja": "季節の変わり目", "reading": "きせつのかわりめ", "vi": "Thời điểm thay đổi của thời tiết"}]}
        ]
    },
    {
        "parent": {
            "word": "〜的",
            "reading": "〜てき",
            "han_viet": "ĐÍCH",
            "grammar_equiv": "〜 trailhead/like/ のような",
            "meaning": "〜 ĐÍCH (Mang tính, hơi hướng)",
            "word_type": "HẬU TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "代表的（な）", "reading": "だいひょうてき", "han_viet": "ĐẠI BIỂU ĐÍCH", "meaning": "Mang tính biểu tượng", "examples": [{"ja": "代表的な映画", "reading": "だいひょうてきなえいが", "vi": "Bộ phim mang tính biểu tượng"}]},
            {"word": "日常的（な）", "reading": "にちじょうてき", "han_viet": "NHẬT THƯỜNG ĐÍCH", "meaning": "Mang tính chất thường ngày", "examples": [{"ja": "日常的な出来事", "reading": "にちじょうてきなできごと", "vi": "Sự việc mang tính chất thường ngày"}]},
            {"word": "進歩的（な）", "reading": "しんぽてき", "han_viet": "TIẾN BỘ ĐÍCH", "meaning": "Mang tính tiến bộ", "examples": [{"ja": "進歩的な考え", "reading": "しんぽてきなかんがえ", "vi": "Suy nghĩ mang tính tiến bộ"}]},
            {"word": "科学的（な）", "reading": "かがくてき", "han_viet": "KHOA HỌC ĐÍCH", "meaning": "Mang tính khoa học", "examples": [{"ja": "科学的な方法", "reading": "かがくてきなほうほう", "vi": "Phương pháp mang tính khoa học"}]},
            {"word": "政治的（な）", "reading": "せいじてき", "han_viet": "CHÍNH TRỊ ĐÍCH", "meaning": "Mang hơi hướng chính trị", "examples": [{"ja": "政治的な発言", "reading": "せいじてきなはつげん", "vi": "Phát ngôn mang hơi hướng chính trị"}]}
        ]
    },
    {
        "parent": {
            "word": "〜風",
            "reading": "〜ふう",
            "han_viet": "PHONG",
            "grammar_equiv": "〜スタイル",
            "meaning": "〜 PHONG (Theo kiểu)",
            "word_type": "HẬU TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "サラリーマン風", "reading": "さらりーまんふう", "han_viet": "PHONG", "meaning": "Trông kiểu người làm công", "examples": [{"ja": "サラリーマン風の男", "reading": "さらりーまんふうのおとこ", "vi": "Người đàn ông trông kiểu người làm công"}]},
            {"word": "関西風", "reading": "かんさいふう", "han_viet": "QUAN TÂY PHONG", "meaning": "Kiểu Kansai", "examples": [{"ja": "関西風の味付け", "reading": "かんさいふうのあじつけ", "vi": "Nêm nếm gia vị theo kiểu Kansai"}]},
            {"word": "西洋風", "reading": "せいようふう", "han_viet": "TÂY DƯƠNG PHONG", "meaning": "Kiểu Tây Âu", "examples": [{"ja": "西洋風の建物", "reading": "せいようふうのたてもの", "vi": "Tòa nhà theo kiểu Tây Âu"}]}
        ]
    },
    {
        "parent": {
            "word": "〜感",
            "reading": "〜かん",
            "han_viet": "CẢM",
            "grammar_equiv": "〜感じ",
            "meaning": "〜 CẢM (Mang đến cảm giác)",
            "word_type": "HẬU TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "存在感", "reading": "そんざいかん", "han_viet": "TỒN TẠI CẢM", "meaning": "Cảm giác tồn tại", "examples": [{"ja": "存在感がある人", "reading": "そんざいかんがあるひと", "vi": "Người mang đến cảm giác tồn tại"}]},
            {"word": "安定感", "reading": "あんていかん", "han_viet": "AN ĐỊNH CẢM", "meaning": "Cảm giác ổn định, chắc chắn", "examples": [{"ja": "安定感がある車", "reading": "あんていかんがあるくるま", "vi": "Xe ô tô có cảm giác an toàn chắc chắn"}]},
            {"word": "清潔感", "reading": "せいけつかん", "han_viet": "THANH KHIẾT CẢM", "meaning": "Cảm giác gọn gàng sạch sẽ", "examples": [{"ja": "清潔感がある男", "reading": "せいけつかんがあるおとこ", "vi": "Người đàn ông có cảm giác sạch sẽ"}]},
            {"word": "開放感", "reading": "かいほうかん", "han_viet": "KHAI PHÓNG CẢM", "meaning": "Cảm giác giải phóng, tự do", "examples": [{"ja": "開放感を味わう", "reading": "かいほうかんをあじわう", "vi": "Thưởng thức cảm giác rộng rãi, tự do"}]}
        ]
    },
    {
        "parent": {
            "word": "〜性",
            "reading": "〜せい",
            "han_viet": "TÍNH",
            "grammar_equiv": "〜せい",
            "meaning": "〜 TÍNH (Mang tính, chất)",
            "word_type": "HẬU TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "創造性", "reading": "そうぞうせい", "han_viet": "SÁNG TẠO TÍNH", "meaning": "Tính sáng tạo", "examples": [{"ja": "創造性を発揮する", "reading": "そうぞうせいをはっきする", "vi": "Phát huy tính sáng tạo"}]},
            {"word": "安全性", "reading": "あんぜんせい", "han_viet": "AN TOÀN TÍNH", "meaning": "Tính an toàn", "examples": [{"ja": "安全性を確かめる", "reading": "あんぜんせいをたしかめる", "vi": "Kiểm tra tính an toàn"}]},
            {"word": "可能性", "reading": "かのうせい", "han_viet": "KHẢ NĂNG TÍNH", "meaning": "Tính khả năng", "examples": [{"ja": "可能性を試す", "reading": "かのうせいをためす", "vi": "Thử tính khả năng"}]},
            {"word": "植物性", "reading": "しょくぶつせい", "han_viet": "THỰC VẬT TÍNH", "meaning": "Tính chất thực vật", "examples": [{"ja": "植物性の油", "reading": "しょくぶつせいのあぶら", "vi": "Dầu mang tính chất thực vật"}]}
        ]
    },
    {
        "parent": {
            "word": "〜製",
            "reading": "〜せい",
            "han_viet": "CHẾ",
            "grammar_equiv": "〜で作られた",
            "meaning": "〜 CHẾ (Sản xuất bởi)",
            "word_type": "HẬU TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "スチール製", "reading": "すちーるせい", "han_viet": "CHẾ", "meaning": "Cái bàn được làm bằng thép", "examples": [{"ja": "スチール製の机", "reading": "すちーるせいのつくえ", "vi": "Cái bàn làm bằng thép"}]},
            {"word": "日本製", "reading": "にほんせい", "han_viet": "NHẬT BẢN CHẾ", "meaning": "Sản xuất tại Nhật Bản", "examples": [{"ja": "日本製の車", "reading": "にほんせいのくるま", "vi": "Xe ô tô sản xuất tại Nhật Bản"}]}
        ]
    },
    {
        "parent": {
            "word": "〜金",
            "reading": "〜きん",
            "han_viet": "KIM",
            "grammar_equiv": "〜お金",
            "meaning": "〜 KIM (Tiền)",
            "word_type": "HẬU TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "入学金", "reading": "にゅうがくきん", "han_viet": "NHẬP HỌC KIM", "meaning": "Phí nhập học", "examples": [{"ja": "入学金を払う", "reading": "にゅうがくきんをはらう", "vi": "Nộp phí nhập học"}]},
            {"word": "税金", "reading": "ぜいきん", "han_viet": "THUẾ KIM", "meaning": "Tiền thuế", "examples": [{"ja": "税金を納める", "reading": "ぜいきんをおさめる", "vi": "Nộp thuế"}]},
            {"word": "年金", "reading": "ねんきん", "han_viet": "NIÊN KIM", "meaning": "Tiền lương hưu", "examples": [{"ja": "年金をもらう", "reading": "ねんきんをもらう", "vi": "Nhận tiền lương hưu"}]},
            {"word": "奨学金", "reading": "しょうがくきん", "han_viet": "TƯỞNG HỌC KIM", "meaning": "Tiền học bổng", "examples": [{"ja": "奨学金を受ける", "reading": "しょうがくきんをうける", "vi": "Nhận học bổng"}]},
            {"word": "保証金", "reading": "ほしょうきん", "han_viet": "BẢO CHỨNG KIM", "meaning": "Tiền bảo hiểm, đặt cọc", "examples": [{"ja": "保証金を納める", "reading": "ほしょうきんをおさめる", "vi": "Đặt cọc tiền bảo đảm"}]}
        ]
    },
    {
        "parent": {
            "word": "〜料",
            "reading": "〜りょう",
            "han_viet": "LIỆU",
            "grammar_equiv": "〜料金",
            "meaning": "〜 LIỆU (Tiền phí)",
            "word_type": "HẬU TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "授業料", "reading": "じゅぎょうりょう", "han_viet": "THỤ NGHIỆP LIỆU", "meaning": "Tiền học phí", "examples": [{"ja": "授業料を納める", "reading": "じゅぎょうりょうをおさめる", "vi": "Đóng học phí"}]},
            {"word": "入場料", "reading": "にゅうじょうりょう", "han_viet": "NHẬP TRƯỜNG LIỆU", "meaning": "Tiền phí vào cửa", "examples": [{"ja": "入場料は無料だ", "reading": "にゅうじょうりょうはむりょうだ", "vi": "Phí vào cửa miễn phí"}]},
            {"word": "保険料", "reading": "ほけんりょう", "han_viet": "BẢO HIỂM LIỆU", "meaning": "Tiền phí bảo hiểm", "examples": [{"ja": "保険料を支払う", "reading": "ほけんりょうにしはらう", "vi": "Đóng phí bảo hiểm"}]},
            {"word": "使用料", "reading": "しようりょう", "han_viet": "SỬ DỤNG LIỆU", "meaning": "Tiền phí sử dụng", "examples": [{"ja": "施設の使用料", "reading": "しせつのしようりょう", "vi": "Phí sử dụng cơ sở vật chất"}]},
            {"word": "バイト料", "reading": "ばいとりょう", "han_viet": "LIỆU", "meaning": "Tiền làm thêm", "examples": [{"ja": "バイト料をもらう", "reading": "ばいとりょうをもらう", "vi": "Nhận tiền lương làm thêm"}]}
        ]
    },
    {
        "parent": {
            "word": "〜代",
            "reading": "〜だい",
            "han_viet": "ĐẠI",
            "grammar_equiv": "〜代金",
            "meaning": "〜 ĐẠI (Tiền)",
            "word_type": "HẬU TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "電気代", "reading": "でんきだい", "han_viet": "ĐIỆN ĐẠI", "meaning": "Tiền điện", "examples": [{"ja": "電気代が高くなる", "reading": "でんきだいがたかくなる", "vi": "Tiền điện trở nên tăng cao"}]},
            {"word": "ガソリン代", "reading": "がそりんだい", "han_viet": "ĐẠI", "meaning": "Tiền xăng xe", "examples": [{"ja": "ガソリン代がかかる", "reading": "がそりんだいがかかる", "vi": "Tốn tiền xăng xe"}]},
            {"word": "修理代", "reading": "しゅうりだい", "han_viet": "TU LÝ ĐẠI", "meaning": "Tiền sửa chữa", "examples": [{"ja": "修理代を払う", "reading": "しゅうりだいをはらう", "vi": "Thanh toán tiền sửa chữa"}]},
            {"word": "飲み代", "reading": "のみだい", "han_viet": "ẨM ĐẠI", "meaning": "Tiền uống rượu", "examples": [{"ja": "飲み代を割り勘にする", "reading": "のみだいをわりかんにする", "vi": "Chia đều tiền uống rượu"}]},
            {"word": "バイト代", "reading": "ばいとだい", "han_viet": "ĐẠI", "meaning": "Tiền làm thêm", "examples": [{"ja": "バイト代が入る", "reading": "ばいとだいが入る", "vi": "Nhận tiền lương làm thêm"}]}
        ]
    },
    {
        "parent": {
            "word": "〜賃",
            "reading": "〜ちん",
            "han_viet": "NHẪM",
            "grammar_equiv": "〜賃金",
            "meaning": "〜 NHẪM (Tiền cước, thuê)",
            "word_type": "HẬU TỐ",
            "is_parent_header": True
        },
        "children": [
            {"word": "運賃", "reading": "うんちん", "han_viet": "VẬN NHẪM", "meaning": "Tiền phí vận chuyển", "examples": [{"ja": "電車運賃", "reading": "でんしゃうんちん", "vi": "Tiền vé tàu điện"}]},
            {"word": "乗車賃", "reading": "じょうしゃちん", "han_viet": "THỪA XA NHẪM", "meaning": "Tiền phí lên xe", "examples": [{"ja": "乗車賃を払う", "reading": "じょうしゃちんをはらう", "vi": "Trả phí đi xe"}]},
            {"word": "家賃", "reading": "やちん", "han_viet": "GIA NHẪM", "meaning": "Tiền thuê nhà", "examples": [{"ja": "家賃を納める", "reading": "やちんをおさめる", "vi": "Trả tiền thuê nhà"}]},
            {"word": "借り賃", "reading": "かりちん", "han_viet": "TÁ NHẪM", "meaning": "Tiền thuê", "examples": [{"ja": "貸し借り賃", "reading": "かしかりちん", "vi": "Tiền phí thuê mượn"}]},
            {"word": "手間賃", "reading": "てまちん", "han_viet": "THỦ GIAN NHẪM", "meaning": "Tiền phí nhân công", "examples": [{"ja": "手間賃をもらう", "reading": "てまちんをもらう", "vi": "Nhận tiền phí công sức"}]}
        ]
    }
]

# Load existing lesson 10 to keep ONLY Chapter 9 words (24 words: 改定 -> 一人前)
with open('src/data/lesson_10.json', 'r', encoding='utf-8') as f:
    l10_data = json.load(f)

ch9_words = []
for w in l10_data['words']:
    # Keep only Chapter 9 words (which have no sub_section or start with 9, and are not corrupted)
    word_str = w.get('word', '')
    if not w.get('is_parent_header') and not w.get('parent_prefix') and not w.get('sub_section') and not any(k in word_str for k in ['あっさり', '犯す', '治める', '及ぼす', '発達', '内容', '値段', '楽', '利益', '不〜', '無〜', '非〜', '未〜', 'Mộtít']):
        ch9_words.append(w)
        if word_str == '一人前':
            break

print(f"Kept {len(ch9_words)} Chapter 9 words for Lesson 10 (from {ch9_words[0]['word']} to {ch9_words[-1]['word']}).")

# Build Chapter 11 structured list
ch11_all_words = []
for g in CHAPTER_11_GROUPS:
    p = g["parent"]
    parent_entry = {
        "word": p["word"],
        "reading": p["reading"],
        "han_viet": p["han_viet"],
        "word_type": p["word_type"],
        "meaning": p["meaning"],
        "grammar_equiv": p["grammar_equiv"],
        "examples": [],
        "is_parent_header": True
    }
    ch11_all_words.append(parent_entry)
    for c in g["children"]:
        child_entry = {
            "word": c["word"],
            "reading": c["reading"],
            "han_viet": c.get("han_viet", ""),
            "word_type": "Tiền tố / Hậu tố",
            "meaning": c["meaning"],
            "examples": c.get("examples", []),
            "parent_prefix": p["word"],
            "is_parent_header": False
        }
        ch11_all_words.append(child_entry)

# Combine for Lesson 10
new_l10_raw = ch9_words + CHAPTER_10_WORDS + ch11_all_words

# Now let's renumber all 10 lessons continuously from 1 to N
global_id = 1

for l_num in range(1, 11):
    path = f"src/data/lesson_{l_num:02d}.json"
    with open(path, 'r', encoding='utf-8') as f:
        l_data = json.load(f)
    
    if l_num == 10:
        words_to_process = new_l10_raw
    else:
        words_to_process = l_data['words']
    
    for w in words_to_process:
        w['id'] = global_id
        global_id += 1
    
    l_data['words'] = words_to_process
    
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(l_data, f, ensure_ascii=False, indent=2)

    print(f"Updated {path}: {len(words_to_process)} words. ID range: {words_to_process[0]['id']} -> {words_to_process[-1]['id']}")

print(f"Done! Next global ID would be {global_id}")
