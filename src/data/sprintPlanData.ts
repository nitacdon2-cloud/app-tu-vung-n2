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
  // GIAI ĐOẠN 1: NẠP TỐC HÀNH & XÂY KHUNG NỀN (NGÀY 1 -> NGÀY 20)
  {
    day: 1,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Nạp tốc hành & Khung nền',
    title: 'Khởi động Tiền tố/Hậu tố & Ngữ pháp Chương 1',
    vocabTask: '⑪ Tiền tố - hậu tố (Mục 1)',
    vocabLessonId: 'lesson_sec_11_01',
    grammarTask: 'Chương 1 (Mẫu 1.1 - 1.6: Thời gian & Trạng thái)',
    grammarChapter: 1,
    readingTask: 'Đọc Mondai 14 (Tìm thông tin - Bài 1)',
    listeningTask: 'Nghe Mondai 4 (Phản xạ câu 1-6)',
    tip: 'Lướt flashcard 5-10s/thẻ, tuyệt đối không ngâm chép cả câu!'
  },
  {
    day: 2,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Nạp tốc hành & Khung nền',
    title: 'Tiền tố/Hậu tố (Mục 2) & Ngữ pháp Chương 2',
    vocabTask: '⑪ Tiền tố - hậu tố (Mục 2)',
    vocabLessonId: 'lesson_sec_11_02',
    grammarTask: 'Chương 2 (Mẫu 2.1 - 2.4: Nhóm nguyên nhân & đặc trưng)',
    grammarChapter: 2,
    readingTask: 'Đọc Mondai 14 (Tìm thông tin - Bài 2)',
    listeningTask: 'Nghe Mondai 4 (Phản xạ câu 7-12)',
    tip: 'Mondai 14 đọc câu hỏi trước rồi gióng vào bảng biểu để khoanh ngay.'
  },
  {
    day: 3,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Nạp tốc hành & Khung nền',
    title: 'Phó từ + Liên từ (P1) & Ngữ pháp Chương 3',
    vocabTask: '⑥ Phó từ + Liên từ (Mục 1)',
    vocabLessonId: 'lesson_sec_06_01',
    grammarTask: 'Chương 3 (Mẫu 3.1 - 3.4: Nhóm bản chất & cảm thán ものだ)',
    grammarChapter: 3,
    readingTask: 'Đọc Mondai 14 (Tìm thông tin - Bài 3)',
    listeningTask: 'Nghe Mondai 4 (Học mẫu kính ngữ phản xạ)',
    tip: 'Phó từ xuất hiện liên tục trong cả Từ vựng lẫn bài Đọc hiểu.'
  },
  {
    day: 4,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Nạp tốc hành & Khung nền',
    title: 'Phó từ + Liên từ (P2) & Ngữ pháp Chương 4',
    vocabTask: '⑥ Phó từ + Liên từ (Mục 2)',
    vocabLessonId: 'lesson_sec_06_02',
    grammarTask: 'Chương 4 (Mẫu 4.1 - 4.4: Nhóm tương phản & giả định)',
    grammarChapter: 4,
    readingTask: 'Đọc Đoản văn Mondai 10 (Bài 1, 2)',
    listeningTask: 'Nghe Mondai 4 (Mẫu mời mọc / nhờ vả)',
    tip: 'Dùng bút gạch chéo / sau trợ từ và liên từ khi đọc đoạn văn.'
  },
  {
    day: 5,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Nạp tốc hành & Khung nền',
    title: 'Phó từ + Liên từ (P3) & Ngữ pháp Chương 5',
    vocabTask: '⑥ Phó từ + Liên từ (Mục 3)',
    vocabLessonId: 'lesson_sec_06_03',
    grammarTask: 'Chương 5 (Mẫu 5.1 - 5.6: Nhóm sự thật & nguyên nhân こと)',
    grammarChapter: 5,
    readingTask: 'Đọc Đoản văn Mondai 10 (Bài 3, 4)',
    listeningTask: 'Nghe Mondai 4 (Mẫu khuyên bảo / phê bình)',
  },
  {
    day: 6,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Nạp tốc hành & Khung nền',
    title: 'Động từ ghép (P1) & Ngữ pháp Chương 6',
    vocabTask: '⑦ Động từ ghép (Mục 1)',
    vocabLessonId: 'lesson_sec_07_01',
    grammarTask: 'Chương 6 (Mẫu 6.1 - 6.6: Nhóm lời khuyên & cảm thán こと)',
    grammarChapter: 6,
    readingTask: 'Đọc Đoản văn Mondai 10 (Bài 5, 6)',
    listeningTask: 'Nghe Mondai 1 (Nhiệm vụ: Bài 1, 2)'
  },
  {
    day: 7,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Nạp tốc hành & Khung nền',
    title: 'Review Tuần 1: Ôn tập & Trắc nghiệm NP Chương 1-6',
    vocabTask: 'Làm Test Từ vựng Tiền tố/Phó từ & Kanji 1-2',
    vocabLessonId: 'lesson_sec_11_01',
    grammarTask: 'Làm bài Test trắc nghiệm Ngữ pháp Chương 1-6',
    grammarChapter: 1,
    readingTask: 'Đọc Đoản văn Mondai 10 (Bài 7, 8)',
    listeningTask: 'Nghe Mondai 1 (Nhiệm vụ: Bài 3, 4)',
    tip: 'Ghi lại mọi câu làm sai vào Sổ tay tử huyệt.'
  },
  {
    day: 8,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Nạp tốc hành & Khung nền',
    title: 'Động từ ghép (P2) & Ngữ pháp Chương 7',
    vocabTask: '⑦ Động từ ghép (Mục 2)',
    vocabLessonId: 'lesson_sec_07_02',
    grammarTask: 'Chương 7 (Mẫu 7.1 - 7.7: Nhóm phạm vi & giới hạn 限る)',
    grammarChapter: 7,
    readingTask: 'Đọc Đoản văn Mondai 10 (Bài 9, 10)',
    listeningTask: 'Nghe Mondai 1 (Nhiệm vụ: Bài 5, 6)'
  },
  {
    day: 9,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Nạp tốc hành & Khung nền',
    title: 'Tính từ i & na & Ngữ pháp Chương 8',
    vocabTask: '④ Tính từ い + ⑤ Tính từ な',
    vocabLessonId: 'lesson_sec_04_01',
    grammarTask: 'Chương 8 (Mẫu 8.1 - 8.6: Ý chí まい & Bất kể かかわらず)',
    grammarChapter: 8,
    readingTask: 'Đọc Đoản văn Mondai 10 (Bài 11, 12)',
    listeningTask: 'Nghe Mondai 2 (Nghe chi tiết: Bài 1, 2)'
  },
  {
    day: 10,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Nạp tốc hành & Khung nền',
    title: 'Phân biệt từ vựng (P1) & Ngữ pháp Chương 9',
    vocabTask: '⑩ Phân biệt từ vựng (Mục 1, 2)',
    vocabLessonId: 'lesson_sec_10_01',
    grammarTask: 'Chương 9 (Mẫu 9.1 - 9.5: Nhóm quan hệ に応じて, に反して)',
    grammarChapter: 9,
    readingTask: 'Đọc Đoản văn Mondai 10 (Bài 13, 14)',
    listeningTask: 'Nghe Mondai 2 (Nghe chi tiết: Bài 3, 4)'
  },
  {
    day: 11,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Nạp tốc hành & Khung nền',
    title: 'Phân biệt từ vựng (P2) & Ngữ pháp Chương 10',
    vocabTask: '⑩ Phân biệt từ vựng (Mục 3, 4)',
    vocabLessonId: 'lesson_sec_10_03',
    grammarTask: 'Chương 10 (Mẫu 10.1 - 10.6: Nhóm căn cứ & thời điểm に基づいて)',
    grammarChapter: 10,
    readingTask: 'Đọc Đoản văn Mondai 10 (Bài 15, 16)',
    listeningTask: 'Nghe Mondai 2 (Nghe chi tiết: Bài 5, 6)'
  },
  {
    day: 12,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Nạp tốc hành & Khung nền',
    title: 'Katakana ngoại lai & Ngữ pháp Chương 11',
    vocabTask: '⑧ Từ ngoại lai Katakana (Mục 1, 2)',
    vocabLessonId: 'lesson_sec_08_01',
    grammarTask: 'Chương 11 (Mẫu 11.1 - 11.5: Nhóm biến đổi & đánh giá にともなって)',
    grammarChapter: 11,
    readingTask: 'Đọc Đoản văn Mondai 10 (Bài 17, 18)',
    listeningTask: 'Nghe Mondai 3 (Ý chính: Bài 1, 2)'
  },
  {
    day: 13,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Nạp tốc hành & Khung nền',
    title: 'Danh từ N2 & Ngữ pháp Chương 12',
    vocabTask: 'Danh từ N2 (Phần 3.8 - 3.11)',
    vocabLessonId: 'lesson_sec_03_08',
    grammarTask: 'Chương 12 (Mẫu 12.1 - 12.6: Nhóm đối tượng をこめて, を問わず)',
    grammarChapter: 12,
    readingTask: 'Đọc Đoản văn Mondai 10 (Bài 19, 20)',
    listeningTask: 'Nghe Mondai 3 (Ý chính: Bài 3, 4)'
  },
  {
    day: 14,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Nạp tốc hành & Khung nền',
    title: 'Review Tuần 2: Ôn tập Động từ & NP Chương 7-12',
    vocabTask: 'Test Kanji 3-5 + Test Từ vựng Động từ',
    vocabLessonId: 'lesson_sec_01_01',
    grammarTask: 'Làm bài Test trắc nghiệm Ngữ pháp Chương 7-12',
    grammarChapter: 7,
    readingTask: 'Đọc Trung văn Mondai 11 (Bài 1 - Bắt ý chính đoạn)',
    listeningTask: 'Nghe Mondai 4 (Luyện đề tổng hợp 12 câu)',
    tip: 'Nghe lần 1 không kịp thì mở Script ở cuối sách xem ngay chỗ bị hẫng âm.'
  },
  {
    day: 15,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Nạp tốc hành & Khung nền',
    title: 'Quét 700 từ cũ theo Cụm từ (Collocation) & NP Chương 13',
    vocabTask: 'Quét lại 700 từ cũ (Kiểm tra Trợ từ & Cụm đi kèm)',
    vocabLessonId: 'lesson_sec_01_02',
    grammarTask: 'Chương 13 (Mẫu 13.1 - 13.8: Nhóm từ góc độ & lập luận からには)',
    grammarChapter: 13,
    readingTask: 'Đọc Trung văn Mondai 11 (Bài 2)',
    listeningTask: 'Nghe Mondai 1 (Luyện đề)'
  },
  {
    day: 16,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Nạp tốc hành & Khung nền',
    title: 'Động từ & Động danh từ Suru & NP Chương 14',
    vocabTask: 'Động từ Suru & Danh động từ (Chương 2)',
    vocabLessonId: 'lesson_sec_02_01',
    grammarTask: 'Chương 14 (Mẫu 14.1 - 14.7: Nhóm giả định & trích dẫn としたら)',
    grammarChapter: 14,
    readingTask: 'Đọc Trung văn Mondai 11 (Bài 3)',
    listeningTask: 'Nghe Mondai 2 (Luyện đề)'
  },
  {
    day: 17,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Nạp tốc hành & Khung nền',
    title: 'Flashcard Từ hay sai & NP Chương 15',
    vocabTask: 'Ôn tập bộ từ vựng đánh dấu sao hoặc hay sai',
    grammarTask: 'Chương 15 (Mẫu 15.1 - 15.7: Nhóm cảm xúc cực độ てならない, てたまらない)',
    grammarChapter: 15,
    readingTask: 'Đọc Trung văn Mondai 11 (Bài 4)',
    listeningTask: 'Nghe Mondai 4 (Luyện đề)'
  },
  {
    day: 18,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Nạp tốc hành & Khung nền',
    title: 'Flashcard Kanji N2 & NP Chương 16',
    vocabTask: 'Flashcard Kanji N2 (Test Kanji 6-8)',
    grammarTask: 'Chương 16 (Mẫu 16.1 - 16.7: Nhóm kết quả 上で, 次第, あげく)',
    grammarChapter: 16,
    readingTask: 'Đọc Trung văn Mondai 11 (Bài 5)',
    listeningTask: 'Nghe Mondai 3 (Luyện đề)'
  },
  {
    day: 19,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Nạp tốc hành & Khung nền',
    title: 'Quét Tiền tố hậu tố lần 2 & NP Chương 17-19',
    vocabTask: 'Quét Tiền tố/Hậu tố + Phó từ lần 2',
    vocabLessonId: 'lesson_sec_11_01',
    grammarTask: 'Chương 17-19 (Tổng kết toàn bộ 112 mẫu Ngữ pháp N2)',
    grammarChapter: 17,
    readingTask: 'Đọc Trung văn Mondai 11 (Bài 6)',
    listeningTask: 'Nghe Mondai 5 (Dạng tổng hợp: Bài 1, 2)'
  },
  {
    day: 20,
    phase: 1,
    phaseTitle: 'Giai đoạn 1: Nạp tốc hành & Khung nền',
    title: 'TỔNG KẾT GIAI ĐOẠN 1: THI THỬ MINITEST P1',
    vocabTask: 'Thi thử Minitest Power Drill P1 (Bấm giờ 20 phút)',
    grammarTask: 'Sửa chi tiết từng câu sai ngữ pháp P1 vào Sổ tay tử huyệt',
    readingTask: 'Đọc lại các câu đọc hiểu sai trong đề P1',
    listeningTask: 'Nghe lại các câu nghe sai trong đề P1',
    tip: 'Đo lường tiến độ nền tảng. Đạt >= 20/30 câu là nền tảng rất vững!'
  },

  // GIAI ĐOẠN 2: THỰC CHIẾN POWER DRILL & TĂNG TỐC KỸ NĂNG (NGÀY 21 -> NGÀY 40)
  {
    day: 21,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Thực chiến Power Drill & Tăng tốc',
    title: 'Minitest Power Drill P2 (Canh giờ 20 phút)',
    vocabTask: 'Flashcard TV + Kanji 60 từ',
    grammarTask: 'Giải Minitest P2 (Kiến thức ngôn ngữ 20 phút)',
    readingTask: 'Trung văn Bài 7 (Áp dụng kỹ thuật Cắt câu /)',
    listeningTask: 'Nghe Shinkanzen Mondai 1 (Nhiệm vụ)'
  },
  {
    day: 22,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Thực chiến Power Drill & Tăng tốc',
    title: 'Minitest Power Drill P3',
    vocabTask: 'Flashcard TV + Kanji 60 từ',
    grammarTask: 'Giải Minitest P3 + Chữa câu sai',
    readingTask: 'Trung văn Bài 8',
    listeningTask: 'Nghe Shinkanzen Mondai 4 (Phản xạ tức thì)'
  },
  {
    day: 23,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Thực chiến Power Drill & Tăng tốc',
    title: 'Minitest Power Drill P4',
    vocabTask: 'Flashcard TV + Kanji 60 từ',
    grammarTask: 'Giải Minitest P4 + Chữa câu sai',
    readingTask: 'Trung văn Bài 9',
    listeningTask: 'Nghe Shinkanzen Mondai 1'
  },
  {
    day: 24,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Thực chiến Power Drill & Tăng tốc',
    title: 'Minitest Power Drill P5',
    vocabTask: 'Flashcard TV + Kanji 60 từ',
    grammarTask: 'Giải Minitest P5 + Chữa câu sai',
    readingTask: 'Trung văn Bài 10',
    listeningTask: 'Nghe Shinkanzen Mondai 4'
  },
  {
    day: 25,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Thực chiến Power Drill & Tăng tốc',
    title: 'Minitest Power Drill P6 (Đạt tốc độ 45s/câu)',
    vocabTask: 'Flashcard TV + Kanji 60 từ',
    grammarTask: 'Giải Minitest P6 + Rà soát Tiền tố/Hậu tố',
    readingTask: 'Trung văn Bài 11',
    listeningTask: 'Nghe Shinkanzen Mondai 1',
    tip: 'Tốc độ làm ngữ pháp đạt 45 giây/câu để dành thời gian cho Đọc hiểu.'
  },
  {
    day: 26,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Thực chiến Power Drill & Tăng tốc',
    title: 'Minitest Power Drill P7 & Bài So sánh (統合理解)',
    vocabTask: 'Flashcard TV + Kanji 60 từ',
    grammarTask: 'Giải Minitest P7',
    readingTask: 'Trung văn 12 + Bài So sánh Bài 1',
    listeningTask: 'Nghe Shinkanzen Mondai 2 (Nghe chi tiết)'
  },
  {
    day: 27,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Thực chiến Power Drill & Tăng tốc',
    title: 'Minitest Power Drill P8',
    vocabTask: 'Flashcard TV + Kanji 60 từ',
    grammarTask: 'Giải Minitest P8',
    readingTask: 'Trung văn 13 + Bài So sánh Bài 2',
    listeningTask: 'Nghe Shinkanzen Mondai 4'
  },
  {
    day: 28,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Thực chiến Power Drill & Tăng tốc',
    title: 'Minitest Power Drill P9',
    vocabTask: 'Flashcard TV + Kanji 60 từ',
    grammarTask: 'Giải Minitest P9',
    readingTask: 'Trung văn 14',
    listeningTask: 'Nghe Shinkanzen Mondai 2'
  },
  {
    day: 29,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Thực chiến Power Drill & Tăng tốc',
    title: 'Minitest Power Drill P10',
    vocabTask: 'Flashcard TV + Kanji 60 từ',
    grammarTask: 'Giải Minitest P10',
    readingTask: 'Trung văn 15',
    listeningTask: 'Nghe Shinkanzen Mondai 4'
  },
  {
    day: 30,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Thực chiến Power Drill & Tăng tốc',
    title: 'Minitest Power Drill P11 (Điểm mục tiêu >= 22/30 câu)',
    vocabTask: 'Flashcard TV + Kanji 60 từ',
    grammarTask: 'Giải Minitest P11 + Tổng kết tuần 4',
    readingTask: 'Trung văn 16',
    listeningTask: 'Nghe Shinkanzen Mondai 2',
    tip: 'Bắt đầu quen với tốc độ đọc lướt tìm ý chính theo liên từ しかし và đuôi câu.'
  },
  {
    day: 31,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Thực chiến Power Drill & Tăng tốc',
    title: 'Minitest Power Drill P12 & Bài Trường văn (長文)',
    vocabTask: 'Quét lại toàn bộ Phó từ + Động từ ghép',
    grammarTask: 'Giải Minitest P12',
    readingTask: 'Trường văn Bài 1 (Chỉ đọc mở đầu, kết và câu có しかし)',
    listeningTask: 'Nghe Shinkanzen Mondai 3 (Ý chính)'
  },
  {
    day: 32,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Thực chiến Power Drill & Tăng tốc',
    title: 'Minitest Power Drill P13',
    vocabTask: 'Flashcard TV + Kanji',
    grammarTask: 'Giải Minitest P13',
    readingTask: 'Trường văn Bài 2',
    listeningTask: 'Nghe Shinkanzen Mondai 5 (Tổng hợp)'
  },
  {
    day: 33,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Thực chiến Power Drill & Tăng tốc',
    title: 'Minitest Power Drill P14',
    vocabTask: 'Flashcard TV + Kanji',
    grammarTask: 'Giải Minitest P14',
    readingTask: 'Trường văn Bài 3',
    listeningTask: 'Nghe Shinkanzen Mondai 3'
  },
  {
    day: 34,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Thực chiến Power Drill & Tăng tốc',
    title: 'Minitest Power Drill P15',
    vocabTask: 'Flashcard TV + Kanji',
    grammarTask: 'Giải Minitest P15',
    readingTask: 'Trường văn Bài 4',
    listeningTask: 'Nghe Shinkanzen Mondai 5'
  },
  {
    day: 35,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Thực chiến Power Drill & Tăng tốc',
    title: 'Minitest Power Drill P16 (Đoản văn đúng 4/5 câu)',
    vocabTask: 'Quét lại danh sách Động từ ghép',
    grammarTask: 'Giải Minitest P16',
    readingTask: 'Luyện 2 bài Đoản văn + 1 bài Thông tin',
    listeningTask: 'Nghe Shinkanzen Mondai 3',
    tip: 'Mondai 14 (thông tin) phải luyện để đúng tuyệt đối 2/2 câu (6 điểm biếu không).'
  },
  {
    day: 36,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Thực chiến Power Drill & Tăng tốc',
    title: 'Minitest Power Drill P17 & Luyện Đọc tổng hợp',
    vocabTask: 'Ôn tập các từ vựng hay bị nhầm lẫn (Mục ⑩)',
    grammarTask: 'Giải Minitest P17',
    readingTask: 'Đề Đọc hiểu tổng hợp (Canh 55-60 phút)',
    listeningTask: 'Luyện tổng hợp 5 Mondai nghe'
  },
  {
    day: 37,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Thực chiến Power Drill & Tăng tốc',
    title: 'Minitest Power Drill P18',
    vocabTask: 'Ôn các từ vựng hay bị nhầm lẫn (Mục ⑩)',
    grammarTask: 'Giải Minitest P18',
    readingTask: 'Đề Đọc hiểu tổng hợp',
    listeningTask: 'Luyện tổng hợp 5 Mondai nghe'
  },
  {
    day: 38,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Thực chiến Power Drill & Tăng tốc',
    title: 'Minitest Power Drill P19',
    vocabTask: 'Ôn Flashcard từ vựng sao',
    grammarTask: 'Giải Minitest P19',
    readingTask: 'Đoản văn + Trung văn',
    listeningTask: 'Nghe Mondai 4 (Phản xạ đúng >= 8/12 câu)'
  },
  {
    day: 39,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Thực chiến Power Drill & Tăng tốc',
    title: 'Minitest Power Drill P20',
    vocabTask: 'Flashcard Kanji N2',
    grammarTask: 'Giải Minitest P20',
    readingTask: 'Đoản văn + Thông tin',
    listeningTask: 'Nghe Mondai 1 & Mondai 4'
  },
  {
    day: 40,
    phase: 2,
    phaseTitle: 'Giai đoạn 2: Thực chiến Power Drill & Tăng tốc',
    title: 'TỔNG KẾT GIAI ĐOẠN 2: MINITEST P21',
    vocabTask: 'Quét toàn bộ từ sai trong 20 đề Minitest',
    grammarTask: 'Giải Minitest P21 + Tổng duyệt Ngữ pháp',
    readingTask: 'Đọc hiểu bấm giờ chuẩn 60 phút',
    listeningTask: 'Nghe tổng hợp 50 phút',
    tip: 'Bạn đã hoàn thành 20 đề ngắn, phản xạ đề thi đã ở mức tự nhiên!'
  },

  // GIAI ĐOẠN 3: LUYỆN ĐỀ THI THẬT CÁC NĂM & TỐI ƯU CHIẾN THUẬT (NGÀY 41 -> NGÀY 53)
  {
    day: 41,
    phase: 3,
    phaseTitle: 'Giai đoạn 3: Luyện Đề thi thật & Tối ưu phòng thi',
    title: 'Đề thi thật N2 12/2020 (Phần Đọc - TV - NP)',
    vocabTask: 'Giải đề thi thật N2 12/2020 (Kiến thức ngôn ngữ + Đọc hiểu)',
    grammarTask: 'Bấm giờ nghiêm ngặt 105 phút không quá 1 phút!',
    readingTask: 'Làm theo thứ tự: Mondai 14 -> Mondai 10 -> Mondai 11 -> Trường văn',
    listeningTask: 'Nghỉ ngơi chuẩn bị cho bài nghe hôm sau',
    tip: 'Chiến thuật phòng thi: Không dừng quá 1 phút ở câu khó!'
  },
  {
    day: 42,
    phase: 3,
    phaseTitle: 'Giai đoạn 3: Luyện Đề thi thật & Tối ưu phòng thi',
    title: 'Đề thi thật N2 12/2020 (Phần Nghe) + Chữa đề',
    vocabTask: 'Chữa chi tiết từng câu sai Từ vựng',
    grammarTask: 'Chữa chi tiết từng câu sai Ngữ pháp, ghi vào Sổ tay tử huyệt',
    readingTask: 'Đọc lại đoạn văn chứa câu trả lời đúng',
    listeningTask: 'Nghe hiểu đề N2 12/2020 (50 phút) + Soi Script câu sai'
  },
  {
    day: 43,
    phase: 3,
    phaseTitle: 'Giai đoạn 3: Luyện Đề thi thật & Tối ưu phòng thi',
    title: 'Đề thi thật N2 07/2021 (Toàn bộ đề)',
    vocabTask: 'Thi thử trọn vẹn đề N2 07/2021',
    grammarTask: 'Canh giờ chuẩn: Đọc+TV+NP 105 phút | Nghe 50 phút',
    readingTask: 'Áp dụng toàn bộ kỹ thuật săn ý tác giả',
    listeningTask: 'Làm trọn vẹn phần Nghe'
  },
  {
    day: 44,
    phase: 3,
    phaseTitle: 'Giai đoạn 3: Luyện Đề thi thật & Tối ưu phòng thi',
    title: 'Chữa đề N2 07/2021 + Ôn Flashcard đề',
    vocabTask: 'Ôn Flashcard các từ vựng mới xuất hiện trong đề',
    grammarTask: 'Rà soát các mẫu ngữ pháp gây bẫy trong đề',
    readingTask: 'Phân tích tại sao đáp án sai lại đánh lừa mình',
    listeningTask: 'Shadowing lời thoại Mondai 4 và Mondai 1'
  },
  {
    day: 45,
    phase: 3,
    phaseTitle: 'Giai đoạn 3: Luyện Đề thi thật & Tối ưu phòng thi',
    title: 'Đề thi thật N2 12/2021 (Toàn bộ đề)',
    vocabTask: 'Thi thử trọn vẹn đề N2 12/2021',
    grammarTask: 'Kiểm soát nhịp độ làm bài',
    readingTask: 'Đọc hiểu tốc độ cao',
    listeningTask: 'Nghe hiểu tập trung cao độ'
  },
  {
    day: 46,
    phase: 3,
    phaseTitle: 'Giai đoạn 3: Luyện Đề thi thật & Tối ưu phòng thi',
    title: 'Chữa đề N2 12/2021 + Ôn Ngữ pháp dấu sao (*)',
    vocabTask: 'Ôn lại từ vựng sai',
    grammarTask: 'Chữa chi tiết + Rà soát toàn bộ bài tập ngữ pháp dấu sao (*)',
    readingTask: 'Xem lại cách phân bổ thời gian bài đọc',
    listeningTask: 'Nghe lại các đoạn chuyển ý でも / やっぱり'
  },
  {
    day: 47,
    phase: 3,
    phaseTitle: 'Giai đoạn 3: Luyện Đề thi thật & Tối ưu phòng thi',
    title: 'Đề thi thật N2 07/2022 (Toàn bộ đề)',
    vocabTask: 'Thi thử trọn vẹn đề N2 07/2022',
    grammarTask: 'Đọc - TV - NP: 105 phút',
    readingTask: 'Giữ vững tâm lý khi gặp bài khó',
    listeningTask: 'Nghe hiểu: 50 phút'
  },
  {
    day: 48,
    phase: 3,
    phaseTitle: 'Giai đoạn 3: Luyện Đề thi thật & Tối ưu phòng thi',
    title: 'Chữa đề N2 07/2022 + Ôn Phó từ & Tiền tố/Hậu tố',
    vocabTask: 'Quét lần cuối danh sách Phó từ và Tiền tố - Hậu tố',
    grammarTask: 'Chữa câu sai vào Sổ tay tử huyệt',
    readingTask: 'Đọc lại bài Mondai 14',
    listeningTask: 'Nghe phản xạ Mondai 4'
  },
  {
    day: 49,
    phase: 3,
    phaseTitle: 'Giai đoạn 3: Luyện Đề thi thật & Tối ưu phòng thi',
    title: 'Đề thi thật N2 gần nhất (12/2022 hoặc 07/2023)',
    vocabTask: 'Làm đề thi thật gần nhất để làm quen form đề hiện đại',
    grammarTask: 'Áp dụng mọi chiến thuật đã rèn luyện',
    readingTask: 'Kiểm soát thời gian hoàn hảo',
    listeningTask: 'Luyện tập sự tập trung liên tục 50 phút'
  },
  {
    day: 50,
    phase: 3,
    phaseTitle: 'Giai đoạn 3: Luyện Đề thi thật & Tối ưu phòng thi',
    title: 'Chữa chi tiết đề gần nhất & Chốt chiến lược phòng thi',
    vocabTask: 'Chữa chi tiết đề gần nhất',
    grammarTask: 'Khắc sâu các bẫy đề thi hiện đại',
    readingTask: 'Chốt thứ tự làm bài: Mondai 14 -> Đoản văn -> Trung văn -> Trường văn',
    listeningTask: 'Tận dụng 20 giây đọc trước câu hỏi Mondai 1, 2'
  },
  {
    day: 51,
    phase: 3,
    phaseTitle: 'Giai đoạn 3: Luyện Đề thi thật & Tối ưu phòng thi',
    title: 'TỔNG RÀ SOÁT LẦN CUỐI: LẬT LẠI SỔ TAY TỬ HUYỆT',
    vocabTask: 'Lật lại toàn bộ cuốn Sổ tay tử huyệt ghi các câu từng làm sai trong 50 ngày qua',
    grammarTask: 'Xem lại 112 mẫu ngữ pháp và câu thần chú',
    readingTask: 'Nghỉ ngơi mắt, không đọc bài mới dài',
    listeningTask: 'Nghe lướt lại các bài phản xạ Mondai 4',
    tip: 'Chỉ cần không lặp lại những câu từng sai là bạn đã cầm chắc tấm bằng N2!'
  },
  {
    day: 52,
    phase: 3,
    phaseTitle: 'Giai đoạn 3: Luyện Đề thi thật & Tối ưu phòng thi',
    title: 'GIỮ TÂM LÝ THẢ LỎNG & NGHỈ NGƠI HỒI PHỤC',
    vocabTask: 'Lướt nhẹ nhàng 20 từ quen thuộc tạo cảm giác tự tin',
    grammarTask: 'Xem lướt bảng tổng hợp ngữ pháp (TỔNG-HỢP-NP-N2.pdf)',
    readingTask: 'Nghỉ ngơi hoàn toàn phần đọc hiểu',
    listeningTask: 'Nghe nhẹ nhàng 10 câu Mondai 4',
    tip: 'Chuẩn bị bút chì 2B, gôm tẩy, đồng hồ đeo tay. Đi ngủ trước 22h00!'
  },
  {
    day: 53,
    phase: 3,
    phaseTitle: 'Giai đoạn 3: Luyện Đề thi thật & Tối ưu phòng thi',
    title: '🎯 NGÀY THI JLPT N2: TỰ TIN CHIẾN THẮNG!',
    vocabTask: 'Ăn sáng đầy đủ, uống nước vừa phải',
    grammarTask: 'Tới phòng thi trước 30-45 phút',
    readingTask: 'Vứt bỏ sự cầu toàn: Câu nào phân vân quá 1 phút -> chọn đáp án khả dĩ rồi đi tiếp!',
    listeningTask: 'Tập trung tuyệt đối từng câu, câu nào qua rồi bỏ qua ngay!',
    tip: 'Mục tiêu là >= 90 điểm để đỗ. Bạn đã chuẩn bị 53 ngày cực kỳ nghiêm túc, bạn chắc chắn làm được!'
  }
];
