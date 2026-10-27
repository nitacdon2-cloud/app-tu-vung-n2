export interface DayPlanItem {
  day: number;
  phase: 1 | 2 | 3;
  phaseTitle: string;
  title: string;
  vocabTask: string;
  vocabLessonId?: string; // id của bài học từ vựng trong app nếu có
  grammarTask: string;
  grammarChapter?: number; // chapter ngữ pháp trong app nếu có
  readingTask: string;
  listeningTask: string;
  tip?: string;
}

export const SPRINT_PLAN_DATA: DayPlanItem[] = [
  // =========================================================================
  // GIAI ĐOẠN 1: BỨT TỐC NỀN TẢNG & RÈN KỸ NĂNG DẠNG BÀI (NGÀY 1 -> NGÀY 14)
  // Xuất phát điểm: Đã hoàn thành Từ vựng 7.1 & Ngữ pháp Chương 7
  // =========================================================================
  {
    day: 1,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Bứt tốc Nền tảng & Rèn kỹ năng',
    title: 'Động từ ghép còn lại (7.2 & 7.3) & Ngữ pháp Chương 8',
    vocabTask: 'Bài 7.2 & 7.3: Động từ ghép (Phần 2 & 3 - dứt điểm Chương 7)',
    vocabLessonId: 'sec_7_2',
    grammarTask: 'Chương 8 (Mẫu 8.1 - 8.6: まい, ようか〜まいか, にしろ, にせよ, にかかわらず, にもかかわらず)',
    grammarChapter: 8,
    readingTask: 'Đọc Mondai 14 (Tìm thông tin - Bài 1 trong Shinkanzen Dokkai)',
    listeningTask: 'Nghe Mondai 4 (Phản xạ tức thì: Câu 1-6 trong Shinkanzen Choukai)',
    tip: 'Động từ ghép nhớ theo ý nghĩa đuôi: 〜出す (bắt đầu/ra ngoài), 〜込む (sâu vào trong), 〜上がる (hoàn thành).'
  },
  {
    day: 2,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Bứt tốc Nền tảng & Rèn kỹ năng',
    title: 'Mỏ vàng Tiền tố (11.1 & 11.2) & Ngữ pháp Chương 9',
    vocabTask: 'Mỏ vàng điểm: Bài 11.1 (不・無・非・未) & 11.2 (再・超・高・低・好・悪・初)',
    vocabLessonId: 'sec_11_1',
    grammarTask: 'Chương 9 (Mẫu 9.1 - 9.5: につけ, に反して, に応じて, に加えて, につき)',
    grammarChapter: 9,
    readingTask: 'Đọc Mondai 14 (Tìm thông tin - Bài 2)',
    listeningTask: 'Nghe Mondai 4 (Phản xạ tức thì: Câu 7-12)',
    tip: 'Mondai 14 đọc câu hỏi trước rồi so chiếu bảng biểu, lấy trọn 6 điểm biếu không!'
  },
  {
    day: 3,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Bứt tốc Nền tảng & Rèn kỹ năng',
    title: 'Tiền tố (11.3, 11.4, 11.5) & Ngữ pháp Chương 10',
    vocabTask: 'Bài 11.3 (各・長・副), 11.4 (名・全・総) & 11.5 (現・前・元・故)',
    vocabLessonId: 'sec_11_3',
    grammarTask: 'Chương 10 (Mẫu 10.1 - 10.6: に基づいて, にしたがって, 際に, に際して, にあたって, にそって)',
    grammarChapter: 10,
    readingTask: 'Đọc Mondai 14 (Tìm thông tin - Bài 3)',
    listeningTask: 'Nghe Mondai 4 (Học mẫu kính ngữ & khiêm nhường ngữ phản xạ)',
    tip: 'Nắm chắc nhóm thời điểm 際に và điều kiện căn cứ に基づいて.'
  },
  {
    day: 4,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Bứt tốc Nền tảng & Rèn kỹ năng',
    title: 'Hậu tố (11.6, 11.7, 11.8) & Ngữ pháp Chương 11',
    vocabTask: 'Bài 11.6 (内・外), 11.7 (化・目) & 11.8 (的・風・感)',
    vocabLessonId: 'sec_11_6',
    grammarTask: 'Chương 11 (Mẫu 11.1 - 11.5: にともなって, にかけては, にしては, にしても, にもかまわず)',
    grammarChapter: 11,
    readingTask: 'Đọc Đoản văn Mondai 10 (Bài 1, 2)',
    listeningTask: 'Nghe Mondai 4 (Mẫu câu mời mọc, nhờ vả và xin phép)',
    tip: 'Gạch chéo / sau chủ ngữ は / が và liên từ しかし / だから khi đọc văn bản.'
  },
  {
    day: 5,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Bứt tốc Nền tảng & Rèn kỹ năng',
    title: 'Trọn bộ Hậu tố (11.9, 11.10) & Ngữ pháp Chương 12',
    vocabTask: 'Bài 11.9 (性・製) & 11.10 (金・代・料・賃) - Hoàn thành 100% Tiền tố Hậu tố',
    vocabLessonId: 'sec_11_9',
    grammarTask: 'Chương 12 (Mẫu 12.1 - 12.6: を込めて, をぬきにして, を問わず, をはじめ, をめぐって, ののもとで)',
    grammarChapter: 12,
    readingTask: 'Đọc Đoản văn Mondai 10 (Bài 3, 4)',
    listeningTask: 'Nghe Mondai 4 (Mẫu câu khuyên bảo, từ chối tế nhị)',
    tip: 'Phân biệt: 〜代 (tiền dịch vụ/đi lại), 〜料 (tiền lệ phí), 〜賃 (tiền thuê/công).'
  },
  {
    day: 6,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Bứt tốc Nền tảng & Rèn kỹ năng',
    title: 'Phân biệt từ vựng P1 (10.1 - 10.5) & Ngữ pháp Chương 13',
    vocabTask: 'Bài 10.1 -> 10.5: Phân biệt あっさり, 犯す/冒す, おさめる, 及ぶ/及ぼす, 発達/発展',
    vocabLessonId: 'sec_10_1',
    grammarTask: 'Chương 13 (Mẫu 13.1 - 13.8: のみならず, はもとより, はともかく, はさておき, からには/以上, からいって, からすると, からして)',
    grammarChapter: 13,
    readingTask: 'Đọc Đoản văn Mondai 10 (Bài 5, 6)',
    listeningTask: 'Nghe Mondai 1 (Nhiệm vụ làm gì tiếp theo: Bài 1, 2)',
    tip: 'Bắt đuôi câu tác giả 〜のではないだろうか, 〜べきだ để chọn đáp án đoản văn.'
  },
  {
    day: 7,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Bứt tốc Nền tảng & Rèn kỹ năng',
    title: 'Phân biệt từ vựng P2 (10.6 - 10.9) & Review Ngữ pháp Tuần 1',
    vocabTask: 'Bài 10.6 -> 10.9: 内容/中身, 値段/価格, 楽/気楽, 利益/収益 + Test Kanji 1-2',
    vocabLessonId: 'sec_10_6',
    grammarTask: 'Review Tuần 1: Trắc nghiệm tổng ôn Ngữ pháp Chương 8 -> 13',
    grammarChapter: 8,
    readingTask: 'Đọc Đoản văn Mondai 10 (Bài 7, 8)',
    listeningTask: 'Nghe Mondai 1 (Nhiệm vụ làm gì tiếp theo: Bài 3, 4)',
    tip: 'Dành 15 phút rà soát lại các câu sai trong tuần, ghi vào Sổ tay tử huyệt.'
  },
  {
    day: 8,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Bứt tốc Nền tảng & Rèn kỹ năng',
    title: 'Katakana Phần 1 (Bài 8.1) & Ngữ pháp Chương 14',
    vocabTask: 'Bài 8.1: Từ Katakana Phần 1 (30 từ N2)',
    vocabLessonId: 'sec_8_1',
    grammarTask: 'Chương 14 (Mẫu 14.1 - 14.7: とは, といった, としても, とともに, としたら, といったら, ということだ)',
    grammarChapter: 14,
    readingTask: 'Đọc Đoản văn Mondai 10 (Bài 9, 10)',
    listeningTask: 'Nghe Mondai 1 (Nhiệm vụ làm gì tiếp theo: Bài 5, 6)',
    tip: 'Katakana nguồn gốc tiếng Anh hay xuất hiện ở Mondai 4 và bài đọc hiểu hiện đại.'
  },
  {
    day: 9,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Bứt tốc Nền tảng & Rèn kỹ năng',
    title: 'Katakana Phần 2 (Bài 8.2) & Ngữ pháp Chương 15',
    vocabTask: 'Bài 8.2: Từ Katakana Phần 2 (32 từ N2)',
    vocabLessonId: 'sec_8_2',
    grammarTask: 'Chương 15 (Mẫu 15.1 - 15.7: のなんのって, あまり, てならない, てたまらない, 得る, やら〜やら, も〜ば〜も)',
    grammarChapter: 15,
    readingTask: 'Đọc Đoản văn Mondai 10 (Bài 11, 12)',
    listeningTask: 'Nghe Mondai 2 (Nghe điểm cốt lõi: Bài 1, 2)',
    tip: 'Gom nhóm cảm xúc: てたまらない (cơ thể/tâm lý không chịu nổi) vs てならない (tự nhiên cảm thấy).'
  },
  {
    day: 10,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Bứt tốc Nền tảng & Rèn kỹ năng',
    title: 'Katakana Phần 3 (Bài 8.3) & Ngữ pháp Chương 16',
    vocabTask: 'Bài 8.3: Từ Katakana Phần 3 (35 từ) - Hoàn thành 100% Katakana N2',
    vocabLessonId: 'sec_8_3',
    grammarTask: 'Chương 16 (Mẫu 16.1 - 16.7: 上で, 次第, あげく, 末, どころではない, おそれがある)',
    grammarChapter: 16,
    readingTask: 'Đọc Đoản văn Mondai 10 (Bài 13, 14)',
    listeningTask: 'Nghe Mondai 2 (Nghe điểm cốt lõi: Bài 3, 4)',
    tip: 'Phân biệt: あげく (sau biến cố dẫn tới kết quả xấu) vs 末 (sau thời gian dài đắn đo).'
  },
  {
    day: 11,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Bứt tốc Nền tảng & Rèn kỹ năng',
    title: 'Từ vựng tổng hợp (Bài 9.1) & Ngữ pháp Chương 17',
    vocabTask: 'Bài 9.1: Từ vựng tổng hợp まとめ (25 từ) - Hoàn tất 100% từ vựng mới N2!',
    vocabLessonId: 'sec_9_1',
    grammarTask: 'Chương 17 (Mẫu 17.1 - 17.6: てはじめて, きり, に先立って, たところ, どころか, ようでは)',
    grammarChapter: 17,
    readingTask: 'Đọc Đoản văn Mondai 10 (Bài 15, 16)',
    listeningTask: 'Nghe Mondai 2 (Nghe điểm cốt lõi: Bài 5, 6)',
    tip: 'Ghi nhớ mẫu どころか: chẳng những không A mà ngược lại còn B cực tệ.'
  },
  {
    day: 12,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Bứt tốc Nền tảng & Rèn kỹ năng',
    title: 'Quét toàn bộ Phó từ & Liên từ & Ngữ pháp Chương 18',
    vocabTask: 'Quét ôn toàn bộ Phó từ & Liên từ (Chương 6.1 -> 6.5) - Chìa khóa Đọc hiểu',
    vocabLessonId: 'sec_6_1',
    grammarTask: 'Chương 18 (Mẫu 18.1 - 18.6: ながら, つつ, わりに, 一方で, 一方だ/ばかりだ, つつある)',
    grammarChapter: 18,
    readingTask: 'Đọc Trung văn Mondai 11 (Bài 1)',
    listeningTask: 'Nghe Mondai 3 (Nghe hiểu khái quát ý chính: Bài 1, 2)',
    tip: 'Phó từ và liên từ là xương sống của mọi bài Đọc hiểu N2, nhận diện là bắt được ý.'
  },
  {
    day: 13,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Bứt tốc Nền tảng & Rèn kỹ năng',
    title: 'Quét ôn Động từ (Chương 1) & Chạm đích Ngữ pháp Chương 19',
    vocabTask: 'Quét ôn Động từ & Collocation Chương 1 (Bài 1.1 -> 1.6)',
    vocabLessonId: 'sec_1_1',
    grammarTask: 'Chương 19 (Mẫu 19.1 - 19.6: ざるをえない, わけにはいかない, ほかない, ようではないか, にほかならない, てはいられない) - HOÀN TẤT 100% 19 CHƯƠNG NGỮ PHÁP N2!',
    grammarChapter: 19,
    readingTask: 'Đọc Trung văn Mondai 11 (Bài 2)',
    listeningTask: 'Nghe Mondai 3 (Nghe hiểu khái quát ý chính: Bài 3, 4)',
    tip: 'Bộ 3 mẫu bắt buộc phải làm: ざるをえない (về lý tính), わけにはいかない (về đạo đức/tâm lý), ほかない (không còn cách nào khác).'
  },
  {
    day: 14,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Bứt tốc Nền tảng & Rèn kỹ năng',
    title: 'Tổng duyệt Giai đoạn 1: Khép lại toàn bộ Nền tảng N2',
    vocabTask: 'Quét ôn Động từ (Bài 1.7 -> 1.11) + Test Kanji 3-5',
    vocabLessonId: 'sec_1_7',
    grammarTask: 'Tổng kết GĐ 1: Làm bài test trắc nghiệm tổng hợp Ngữ pháp Chương 14 -> 19',
    grammarChapter: 14,
    readingTask: 'Đọc Trung văn Mondai 11 (Bài 3)',
    listeningTask: 'Nghe Mondai 4 (Luyện đề trọn gói 12 câu phản xạ)',
    tip: 'Chúc mừng bạn! Bạn đã trang bị đủ 100% toàn bộ kiến thức Từ vựng & Ngữ pháp N2!'
  },

  // =========================================================================
  // GIAI ĐOẠN 2: THỰC CHIẾN POWER DRILL & TĂNG TỐC KỸ NĂNG (NGÀY 15 -> NGÀY 28)
  // Mục tiêu: Luyện 14 đề Minitest Pawadoriru, tăng tốc phản xạ, làm chủ các dạng bài
  // =========================================================================
  {
    day: 15,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Power Drill Thực chiến & Tăng tốc kỹ năng',
    title: 'Khởi động Power Drill P1 & Trung văn 4',
    vocabTask: 'Quét lại Danh động từ Chương 2 (2.1 -> 2.5)',
    vocabLessonId: 'sec_2_1',
    grammarTask: 'Giải Minitest Power Drill P1 (bấm giờ 20 phút) + Chữa chi tiết',
    readingTask: 'Đọc Trung văn Mondai 11 (Bài 4)',
    listeningTask: 'Shinkanzen Choukai Mondai 1 (Bài 1, 2) + Soi Script',
    tip: 'Xem lại những câu ngữ pháp làm sai, chép ngay vào Sổ tay tử huyệt.'
  },
  {
    day: 16,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Power Drill Thực chiến & Tăng tốc kỹ năng',
    title: 'Power Drill P2 & Trung văn 5',
    vocabTask: 'Quét lại Danh từ Chương 3 (3.1 -> 3.5)',
    vocabLessonId: 'sec_3_1',
    grammarTask: 'Giải Minitest Power Drill P2 (20 phút) + Chữa chi tiết',
    readingTask: 'Đọc Trung văn Mondai 11 (Bài 5)',
    listeningTask: 'Shinkanzen Choukai Mondai 1 (Bài 3, 4) + Soi Script',
    tip: 'Tập trung tìm bẫy trợ từ (に vs を vs で) trong bài điền từ.'
  },
  {
    day: 17,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Power Drill Thực chiến & Tăng tốc kỹ năng',
    title: 'Power Drill P3 & Trung văn 6',
    vocabTask: 'Quét lại Danh từ Chương 3 (3.6 -> 3.11)',
    vocabLessonId: 'sec_3_6',
    grammarTask: 'Giải Minitest Power Drill P3 (20 phút) + Chữa chi tiết',
    readingTask: 'Đọc Trung văn Mondai 11 (Bài 6)',
    listeningTask: 'Shinkanzen Choukai Mondai 2 (Bài 1, 2) + Soi Script',
    tip: 'Đọc Trung văn: Đọc câu hỏi -> Đọc đoạn văn tương ứng để tìm đáp án, không đọc tràn lan.'
  },
  {
    day: 18,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Power Drill Thực chiến & Tăng tốc kỹ năng',
    title: 'Power Drill P4 & Trung văn 7, 8',
    vocabTask: 'Quét lại Tính từ đuôi -i và -na (Chương 4 & 5)',
    vocabLessonId: 'sec_4_1',
    grammarTask: 'Giải Minitest Power Drill P4 (20 phút) + Chữa chi tiết',
    readingTask: 'Đọc Trung văn Mondai 11 (Bài 7, 8)',
    listeningTask: 'Shinkanzen Choukai Mondai 2 (Bài 3, 4) + Soi Script',
    tip: 'Nghe Mondai 2 có 20s chuẩn bị: gạch chân từ khóa trong 4 đáp án.'
  },
  {
    day: 19,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Power Drill Thực chiến & Tăng tốc kỹ năng',
    title: 'Power Drill P5 & Đọc So sánh quan điểm 1',
    vocabTask: 'Quét lại Tiền tố - Hậu tố lần 2 (Mục 11.1 -> 11.5)',
    vocabLessonId: 'sec_11_1',
    grammarTask: 'Giải Minitest Power Drill P5 (20 phút) + Chữa chi tiết',
    readingTask: 'Đọc bài So sánh quan điểm (統合理解 - Bài 1)',
    listeningTask: 'Shinkanzen Choukai Mondai 3 (Bài 1, 2) + Soi Script',
    tip: 'Bài So sánh: Tìm điểm chung hoặc điểm khác biệt giữa 2 tác giả A và B.'
  },
  {
    day: 20,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Power Drill Thực chiến & Tăng tốc kỹ năng',
    title: 'Power Drill P6 & Đọc So sánh quan điểm 2',
    vocabTask: 'Quét lại Tiền tố - Hậu tố lần 2 (Mục 11.6 -> 11.10)',
    vocabLessonId: 'sec_11_6',
    grammarTask: 'Giải Minitest Power Drill P6 (20 phút) + Chữa chi tiết',
    readingTask: 'Đọc bài So sánh quan điểm (統合理解 - Bài 2)',
    listeningTask: 'Shinkanzen Choukai Mondai 3 (Bài 3, 4) + Soi Script',
    tip: 'Nghe Mondai 3 không có chữ trong đề, hãy nhắm mắt hoặc ghi chép từ khóa chính ra nháp.'
  },
  {
    day: 21,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Power Drill Thực chiến & Tăng tốc kỹ năng',
    title: 'Power Drill P7 & Đọc So sánh quan điểm 3',
    vocabTask: 'Quét lại Động từ ghép Chương 7',
    vocabLessonId: 'sec_7_1',
    grammarTask: 'Giải Minitest Power Drill P7 (20 phút) + Chữa chi tiết',
    readingTask: 'Đọc bài So sánh quan điểm (統合理解 - Bài 3)',
    listeningTask: 'Shinkanzen Choukai Mondai 4 (Luyện đề tốc độ: 12 câu)',
    tip: 'Phản xạ tức thì Mondai 4: Để ý các đuôi câu rút gọn tiếng Nhật thân mật hoặc kính ngữ chuẩn.'
  },
  {
    day: 22,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Power Drill Thực chiến & Tăng tốc kỹ năng',
    title: 'Power Drill P8 & Đọc Trường văn 1',
    vocabTask: 'Quét lại Katakana Chương 8',
    vocabLessonId: 'sec_8_1',
    grammarTask: 'Giải Minitest Power Drill P8 (20 phút) + Chữa chi tiết',
    readingTask: 'Đọc bài Trường văn (Trường văn - Bài 1: Kỹ thuật chia đoạn)',
    listeningTask: 'Shinkanzen Choukai Mondai 4 (Luyện đề tiếp 12 câu)',
    tip: 'Bài Trường văn: Mỗi câu hỏi tương ứng với 1-2 đoạn văn, làm cuốn chiếu từng đoạn.'
  },
  {
    day: 23,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Power Drill Thực chiến & Tăng tốc kỹ năng',
    title: 'Power Drill P9 & Đọc Trường văn 2',
    vocabTask: 'Quét lại Phân biệt từ vựng Chương 10',
    vocabLessonId: 'sec_10_1',
    grammarTask: 'Giải Minitest Power Drill P9 (20 phút) + Chữa chi tiết',
    readingTask: 'Đọc bài Trường văn (Trường văn - Bài 2)',
    listeningTask: 'Shinkanzen Choukai Mondai 5 (Thông tin tổng hợp: Bài 1)',
    tip: 'Nghe Mondai 5 câu hỏi xuất hiện ở cuối cùng: Ghi chép cột A, B, C, D kèm điều kiện.'
  },
  {
    day: 24,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Power Drill Thực chiến & Tăng tốc kỹ năng',
    title: 'Power Drill P10 & Luyện Đọc tổng hợp bấm giờ',
    vocabTask: 'Quét nhanh các từ thường gặp trong đề thi N2 (Mondai 4: Điền từ)',
    grammarTask: 'Giải Minitest Power Drill P10 (20 phút) + Chữa chi tiết',
    readingTask: 'Luyện đề Đọc hiểu tổng hợp theo thời gian chuẩn (55-60 phút)',
    listeningTask: 'Shinkanzen Choukai Mondai 5 (Thông tin tổng hợp: Bài 2)',
    tip: 'Phân bổ thời gian: Mondai 14 (5p) -> Đoản văn (20p) -> Trung văn (20p) -> Trường văn & So sánh (15p).'
  },
  {
    day: 25,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Power Drill Thực chiến & Tăng tốc kỹ năng',
    title: 'Power Drill P11 & Rèn Ngữ pháp dấu sao (*)',
    vocabTask: 'Ôn tập 50 từ hay sai nhất trên App Flashcard',
    grammarTask: 'Giải Minitest Power Drill P11 + Rèn kỹ thuật làm bài ngữ pháp dấu sao (*)',
    readingTask: 'Đọc lại các câu sai trong bài đọc hiểu từ D15-D24',
    listeningTask: 'Luyện đề Choukai tổng hợp 1 set đề thi thử',
    tip: 'Dấu sao (*): Ghép các cụm cố định lại với nhau trước (Danh từ + Trợ từ, Mẫu ngữ pháp).'
  },
  {
    day: 26,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Power Drill Thực chiến & Tăng tốc kỹ năng',
    title: 'Power Drill P12 & Mondai 14 Phản xạ 5 phút',
    vocabTask: 'Luyện Test Từ vựng trắc nghiệm trên App',
    grammarTask: 'Giải Minitest Power Drill P12 (20 phút) + Chữa chi tiết',
    readingTask: 'Luyện thêm 1 bài Mondai 14 (Tìm kiếm thông tin) để giữ tốc độ phản xạ 5 phút',
    listeningTask: 'Shadowing lại 10 câu Mondai 4 quen thuộc',
    tip: 'Mondai 14 phải luôn đạt 100% độ chính xác (biếu không 6 điểm).'
  },
  {
    day: 27,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Power Drill Thực chiến & Tăng tốc kỹ năng',
    title: 'Power Drill P13 & Đoản văn tốc độ cao',
    vocabTask: 'Lướt lại các cặp từ đồng nghĩa Mondai 5',
    grammarTask: 'Giải Minitest Power Drill P13 (20 phút) + Chữa chi tiết',
    readingTask: 'Luyện Đoản văn 3 bài liên tiếp bấm giờ 10 phút',
    listeningTask: 'Nghe Mondai 1 và 2 (Luyện bắt từ khóa phủ định và chuyển ý)',
    tip: 'Chú ý các từ bẫy: しかし, ところが, やはり, ただ.'
  },
  {
    day: 28,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Power Drill Thực chiến & Tăng tốc kỹ năng',
    title: 'Tổng kết Giai đoạn 2: Đo lường tiến độ trước Đề thật',
    vocabTask: 'Tổng kết GĐ 2: Ôn lại toàn bộ Sổ tay tử huyệt Từ vựng',
    grammarTask: 'Giải Minitest Power Drill P14 (Đo lường tiến độ trước khi bước vào đề thi thật)',
    readingTask: 'Rà soát lại chiến thuật đọc hiểu, không dịch từng chữ',
    listeningTask: 'Tổng kết các mẫu phản xạ Mondai 4',
    tip: 'Điểm Minitest đạt >= 22/30 câu chứng tỏ bạn đã sẵn sàng chiến đấu với đề thi thật!'
  },

  // =========================================================================
  // GIAI ĐOẠN 3: LUYỆN ĐỀ THI THẬT CÁC NĂM & TỐI ƯU PHÒNG THI (NGÀY 29 -> NGÀY 40)
  // Mục tiêu: Bấm giờ thi thật với các bộ đề N2, sửa cặn kẽ từng lỗi, chốt tâm lý đỗ N2
  // =========================================================================
  {
    day: 29,
    phase: 3,
    phaseTitle: 'Giai đoạn 3: Luyện Đề thi thật & Tối ưu phòng thi',
    title: 'Đề thi thật N2 12/2020: Phần Đọc - TV - NP',
    vocabTask: 'Giải đề thi thật N2 12/2020 (Kiến thức ngôn ngữ: TV + NP - 40 phút)',
    grammarTask: 'Kiểm soát tốc độ ngữ pháp 40s/câu',
    readingTask: 'Giải đề thi thật N2 12/2020 (Phần Đọc hiểu - 65 phút)',
    listeningTask: 'Nghỉ ngơi tai, chuẩn bị cho ngày nghe tiếp theo',
    tip: 'Thực hiện đúng kỷ luật thời gian, không mở tài liệu tra cứu khi làm.'
  },
  {
    day: 30,
    phase: 3,
    phaseTitle: 'Giai đoạn 3: Luyện Đề thi thật & Tối ưu phòng thi',
    title: 'Đề thi thật N2 12/2020: Nghe hiểu & Chữa cặn kẽ',
    vocabTask: 'Chữa chi tiết phần TV + NP Đề 12/2020, ghi ngay câu sai vào Sổ tay tử huyệt',
    grammarTask: 'Phân tích các đáp án gây nhiễu trong đề',
    readingTask: 'Đọc lại các câu đọc hiểu bị sai, tìm vị trí từ khóa trong bài văn',
    listeningTask: 'Giải Đề thi thật N2 12/2020 (Phần Nghe hiểu - 50 phút) + Chữa chi tiết & Shadowing Script',
    tip: 'Ghi nhận số điểm ước tính lần 1 để định hình vị trí hiện tại.'
  },
  {
    day: 31,
    phase: 3,
    phaseTitle: 'Giai đoạn 3: Luyện Đề thi thật & Tối ưu phòng thi',
    title: 'Đề thi thật N2 07/2021: Thi thử trọn gói',
    vocabTask: 'Thi thử trọn gói đề N2 07/2021 (Đọc - TV - NP: 105 phút)',
    grammarTask: 'Áp dụng thứ tự làm bài tối ưu',
    readingTask: 'Tập trung đọc hiểu với áp lực thời gian',
    listeningTask: 'Thi trọn vẹn phần Nghe hiểu đề 07/2021 (50 phút)',
    tip: 'Giữ tư thế ngồi thẳng và không khí nghiêm túc như trong phòng thi thật.'
  },
  {
    day: 32,
    phase: 3,
    phaseTitle: 'Giai đoạn 3: Luyện Đề thi thật & Tối ưu phòng thi',
    title: 'Chữa toàn diện Đề 07/2021 & Luyện Flashcard đề',
    vocabTask: 'Tạo Flashcard riêng cho các từ mới xuất hiện trong đề 07/2021',
    grammarTask: 'Phân tích tại sao đáp án sai lại đánh lừa mình',
    readingTask: 'Đọc lại bài trường văn và so sánh với lời giải chi tiết',
    listeningTask: 'Nghe lại những câu bị lừa ở Mondai 1 và Mondai 4',
    tip: 'Chữa đề kỹ quan trọng gấp 3 lần số lượng đề bạn làm!'
  },
  {
    day: 33,
    phase: 3,
    phaseTitle: 'Giai đoạn 3: Luyện Đề thi thật & Tối ưu phòng thi',
    title: 'Đề thi thật N2 12/2021: Thi thử trọn gói',
    vocabTask: 'Thi thử trọn gói đề N2 12/2021 (Đọc - TV - NP: 105 phút)',
    grammarTask: 'Kiểm soát nhịp độ làm bài',
    readingTask: 'Đọc hiểu tốc độ cao, bám chắc từ khóa',
    listeningTask: 'Thi trọn vẹn phần Nghe hiểu đề 12/2021 (50 phút)',
    tip: 'Rèn kỹ năng lướt câu hỏi Mondai 14 trước khi vào bài thi đọc.'
  },
  {
    day: 34,
    phase: 3,
    phaseTitle: 'Giai đoạn 3: Luyện Đề thi thật & Tối ưu phòng thi',
    title: 'Chữa Đề 12/2021 & Rà soát Ngữ pháp dấu sao (*)',
    vocabTask: 'Ôn tập danh sách phó từ và tiền tố - hậu tố lặp lại trong đề',
    grammarTask: 'Chữa chi tiết + Rà soát toàn bộ bài tập ngữ pháp dấu sao (*)',
    readingTask: 'Xem lại cách phân bổ thời gian bài đọc hiểu',
    listeningTask: 'Nghe lại các đoạn chuyển ý でも / やっぱり trong phần nghe',
    tip: 'Ngữ pháp N2 có tính chu kỳ rất cao, các mẫu của năm 2021 rất hay xuất hiện lại!'
  },
  {
    day: 35,
    phase: 3,
    phaseTitle: 'Giai đoạn 3: Luyện Đề thi thật & Tối ưu phòng thi',
    title: 'Đề thi thật N2 07/2022: Thi thử trọn gói',
    vocabTask: 'Thi thử trọn vẹn đề N2 07/2022 (Đọc - TV - NP: 105 phút)',
    grammarTask: 'Duy trì sự bình tĩnh tuyệt đối',
    readingTask: 'Giữ vững tâm lý khi gặp bài khó',
    listeningTask: 'Thi trọn vẹn phần Nghe hiểu đề 07/2022 (50 phút)',
    tip: 'Khi gặp bài đọc khó hiểu, bình tĩnh tìm câu hỏi hỏi gì và bám sát đoạn chứa từ khóa.'
  },
  {
    day: 36,
    phase: 3,
    phaseTitle: 'Giai đoạn 3: Luyện Đề thi thật & Tối ưu phòng thi',
    title: 'Chữa Đề 07/2022 & Ôn 112 Mẫu Ngữ pháp thần chú',
    vocabTask: 'Cập nhật các câu sai vào Sổ tay tử huyệt',
    grammarTask: 'Lướt lại 112 mẫu ngữ pháp và câu thần chú',
    readingTask: 'Đọc lại bài Mondai 14',
    listeningTask: 'Nghe lại các câu Mondai 4 tốc độ 1.0x',
    tip: 'Chú ý các từ vựng thuộc nhóm Kinh tế - Xã hội và Công việc hay ra ở N2 gần đây.'
  },
  {
    day: 37,
    phase: 3,
    phaseTitle: 'Giai đoạn 3: Luyện Đề thi thật & Tối ưu phòng thi',
    title: 'Đề thi thật N2 gần nhất (12/2022 hoặc 07/2023)',
    vocabTask: 'Làm đề thi thật gần nhất để thích ứng form đề hiện đại',
    grammarTask: 'Áp dụng mọi chiến thuật đã rèn luyện',
    readingTask: 'Kiểm soát thời gian hoàn hảo',
    listeningTask: 'Luyện tập sự tập trung liên tục 50 phút',
    tip: 'Đề gần nhất giúp bạn thích ứng với văn phong và độ dài thực tế của đề thi hiện tại.'
  },
  {
    day: 38,
    phase: 3,
    phaseTitle: 'Giai đoạn 3: Luyện Đề thi thật & Tối ưu phòng thi',
    title: 'Chữa chi tiết Đề gần nhất & Chốt chiến lược phòng thi',
    vocabTask: 'Chữa chi tiết đề gần nhất',
    grammarTask: 'Khắc sâu các bẫy đề thi hiện đại',
    readingTask: 'Chốt thứ tự làm bài: Mondai 14 -> Đoản văn -> Trung văn -> Trường văn',
    listeningTask: 'Tận dụng 20 giây đọc trước câu hỏi Mondai 1, 2',
    tip: 'Chiến thuật phòng thi chuẩn: Mondai 1-6 (20p) -> Mondai 7-9 (15-20p) -> Mondai 14 (5p) -> Đoản văn (20p) -> Trung văn (20p) -> Trường văn & So sánh (20p).'
  },
  {
    day: 39,
    phase: 3,
    phaseTitle: 'Giai đoạn 3: Luyện Đề thi thật & Tối ưu phòng thi',
    title: 'TỔNG RÀ SOÁT LẦN CUỐI: LẬT LẠI SỔ TAY TỬ HUYỆT',
    vocabTask: 'Lật lại toàn bộ cuốn Sổ tay tử huyệt ghi các câu từng làm sai trong 38 ngày qua',
    grammarTask: 'Xem lại 112 mẫu ngữ pháp và câu thần chú',
    readingTask: 'Nghỉ ngơi mắt, không đọc bài mới dài',
    listeningTask: 'Nghe nhẹ nhàng 15-20 câu Mondai 4 quen thuộc để giữ nhịp tai',
    tip: 'Không lặp lại những sai lầm cũ = Cầm chắc tấm bằng N2 trong tay!'
  },
  {
    day: 40,
    phase: 3,
    phaseTitle: 'Giai đoạn 3: Luyện Đề thi thật & Tối ưu phòng thi',
    title: '🎯 NGÀY THI JLPT N2: BƯỚC VÀO PHÒNG THI TỰ TIN CHIẾN THẮNG!',
    vocabTask: 'Ăn sáng vừa đủ, chuẩn bị bút chì 2B, gôm tẩy, đồng hồ đeo tay',
    grammarTask: 'Tới phòng thi trước 30-45 phút, giữ tinh thần sảng khoái',
    readingTask: 'Vứt bỏ sự cầu toàn: Phân vân quá 1 phút -> chọn ngay đáp án khả dĩ rồi đi tiếp!',
    listeningTask: 'Tập trung tuyệt đối từng câu nghe, câu nào qua rồi dứt khoát bỏ qua!',
    tip: 'Mục tiêu là >= 90 điểm để đỗ N2. Bạn đã chuẩn bị 40 ngày cực kỳ nghiêm túc và thực chiến, bạn chắc chắn làm được!'
  }
];
