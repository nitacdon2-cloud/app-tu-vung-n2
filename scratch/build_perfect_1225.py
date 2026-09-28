import os
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

import pykakasi
kks = pykakasi.kakasi()

def get_sentence_reading(sentence):
    if not sentence:
        return ""
    try:
        res = kks.convert(sentence)
        return ''.join([item['hira'] for item in res])
    except Exception:
        return ""

PREFERRED_HV = {
    '引': 'DẪN', '打': 'ĐẢ', '計': 'KẾ', '量': 'LƯỢNG', '齧': 'NIẾT',
    '静': 'TĨNH', '躓': 'CHÍ', '頷': 'HÀM', '吐': 'THỔ', '傷': 'THƯƠNG',
    '見': 'KIẾN', '舞': 'VŨ', '転': 'CHUYỂN', '配': 'PHỐI', '放': 'PHÓNG',
    '床': 'SÀN', '切': 'THIẾT', '重': 'TRỌNG', '空': 'KHÔNG', '行': 'HÀNH',
    '生': 'SINH', '相': 'TƯƠNG', '場': 'TRƯỜNG', '分': 'PHÂN', '長': 'TRƯỜNG',
    '悪': 'ÁC', '強': 'CƯỜNG', '正': 'CHÍNH', '好': 'HẢO', '大': 'ĐẠI',
    '小': 'TIỂU', '高': 'CAO', '安': 'AN', '新': 'TÂN', '古': 'CỔ'
}

def get_han_viet(word_str):
    if not word_str:
        return ""
    hv_chars = []
    for ch in word_str:
        if '\u4e00' <= ch <= '\u9fff':
            hv = PREFERRED_HV.get(ch, "")
            if hv:
                hv_chars.append(hv)
    return ' '.join(hv_chars) if hv_chars else ""

temp_dir = 'temp_v5_out'

# Natural sort helper for subsection files: lesson_1, lesson_2 ... lesson_50
def sub_sort_key(filename):
    m = re.search(r'lesson_(\d+)\.json', filename)
    if m:
        return int(m.group(1))
    return 0

json_files = sorted([f for f in os.listdir(temp_dir) if f.endswith('.json')], key=sub_sort_key)

all_vocab_list = []

# Manual high-precision overrides for Ch 10 (Phân biệt từ vựng)
CH10_OVERRIDE = {
    "あっさり": "① Nhạt, thanh ② Đơn giản, chóng vánh",
    "さっぱり": "① Nhạt, thanh ② Hoàn toàn ③ Thoải mái ④ Thẳng tính",
    "すっかり": "① Tất cả, hoàn toàn ② Thay đổi hoàn toàn",
    "犯す": "Vi phạm luật định, luật pháp, luân thường đạo lý ; Phạm tội",
    "侵す": "Xâm phạm vào thứ của người khác ; Xâm phạm lãnh hải",
    "冒す": "Ảnh hưởng ; Mạo phạm ; Đương đầu với nguy hiểm",
    "治める・治まる": "① Trị vì, cai trị ② Làm cho ổn định ③ Được cải thiện",
    "修める・修まる": "① Trau dồi tu luyện ② Tốt lên, bản thân được trau dồi",
    "収める・収まる": "① Cất đi ② Thu được ③ Vừa, trở nên ổn định",
    "かける・かかる": "① Treo, bắc (cầu) ② Tốn (thời gian, tiền bạc) ③ Bắt đầu làm",
    "切る・切れる": "① Cắt, dứt ② Hết, cạn kiệt ③ Hết hạn",
    "つく・つける": "① Dính, gắn ② Đạt được, có được ③ Đi kèm",
    "通る・通す": "① Đi qua, thông qua ② Xỏ qua, xuyên qua ③ Tiếp tục",
    "引く・引ける": "① Kéo, rút ② Rút lùi ③ Tra cứu",
    "ふる・ふれる": "① Vẫy, rung ② Từ chối, bỏ rơi ③ Chạm vào",
}

for fname in json_files:
    filepath = os.path.join(temp_dir, fname)
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        sub_name = data.get("lesson_name", "")
        # Clean sub_name e.g. "N2 Chương 1 - Động từ 1.1" -> "1.1 Động từ"
        sub_title = sub_name.replace("N2 Chương ", "").replace(" - ", " ")
        
        words = data.get("words", [])
        for w in words:
            word_str = w.get("word", "").strip()
            meaning_str = w.get("meaning", "").strip()
            
            # Apply Ch 10 override if word matches
            if word_str in CH10_OVERRIDE:
                meaning_str = CH10_OVERRIDE[word_str]
                
            all_vocab_list.append({
                "word": word_str,
                "reading": w.get("reading", "") or get_sentence_reading(word_str),
                "han_viet": w.get("han_viet", "") or get_han_viet(word_str),
                "word_type": w.get("word_type", "Từ vựng"),
                "meaning": meaning_str,
                "examples": w.get("examples", []),
                "sub_section": sub_title
            })

print(f"Total vocabulary items compiled: {len(all_vocab_list)}")

# Assign global IDs 1..N (1 to ~1225)
for global_id, item in enumerate(all_vocab_list, start=1):
    item["id"] = global_id

# 10 Days Distribution
DAY_TITLES = [
    "BUỔI 1: N2 Động từ (Phần 1)",
    "BUỔI 2: N2 Động từ (Phần 2)",
    "BUỔI 3: N2 Động danh từ (Suru Verbs)",
    "BUỔI 4: N2 Danh từ (Phần 1)",
    "BUỔI 5: N2 Danh từ (Phần 2)",
    "BUỔI 6: N2 Danh từ (Phần 3) & Tính từ",
    "BUỔI 7: N2 Phó từ, Từ nối & Động từ ghép",
    "BUỔI 8: N2 Katakana & Từ vựng ngoại lai",
    "BUỔI 9: N2 Phân biệt từ vựng",
    "BUỔI 10: N2 Tiền tố & Hậu tố"
]

output_dir = os.path.join('src', 'data')

# Clear old json files in src/data
for f in os.listdir(output_dir):
    if f.endswith('.json'):
        os.remove(os.path.join(output_dir, f))

# Calculate day splits based on sub-sections or even count
total_words = len(all_vocab_list)
words_per_day = total_words // 10
remainder = total_words % 10

curr_idx = 0
for day in range(1, 11):
    count_today = words_per_day + (1 if day <= remainder else 0)
    day_words = all_vocab_list[curr_idx : curr_idx + count_today]
    curr_idx += count_today

    day_title = DAY_TITLES[day - 1]
    lesson_id = f"lesson_{day:02d}"
    file_name = f"lesson_{day:02d}.json"
    file_path = os.path.join(output_dir, file_name)

    output_json = {
        "lesson_id": lesson_id,
        "lesson_name": day_title,
        "level": "N2",
        "words": day_words
    }

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(output_json, f, ensure_ascii=False, indent=2)

    print(f"Generated {file_name}: {day_title} ({len(day_words)} words, IDs #{day_words[0]['id']} - #{day_words[-1]['id']})")

print("\nSUCCESS! All 10 lessons generated with global 1..N IDs and sub_section tags!")
