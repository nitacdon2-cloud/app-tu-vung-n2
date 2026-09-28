import os
import json
import re
import sys

sys.path.insert(0, os.path.abspath('.'))
sys.stdout.reconfigure(encoding='utf-8')

from scratch.extract_full_pdf_to_10_lessons import extract_all_pdf_vocab, get_han_viet, get_sentence_reading, clean_text

pdf_file = os.path.join(
    'FILE SÁCH KANJI - TV - NP N2 (PDF)',
    'PDF TỪ VỰNG N2',
    'N2 - từ vựng 201223.pdf'
)

words = extract_all_pdf_vocab(pdf_file)

# Audit words
cleaned_words = []
seen_pairs = set()

for idx, w in enumerate(words, start=1):
    w_str = clean_text(w.get("word", ""))
    r_str = clean_text(w.get("reading", ""))
    m_str = clean_text(w.get("meaning", ""))
    w_type = w.get("word_type", "Từ vựng")
    ex_list = w.get("examples", [])

    if not w_str:
        continue
        
    # Deduplicate exact duplicate word+meaning entries
    pair_key = (w_str, m_str)
    if pair_key in seen_pairs and len(w_str) < 10:
        continue
    seen_pairs.add(pair_key)

    if not r_str:
        r_str = get_sentence_reading(w_str)

    hv_str = get_han_viet(w_str)

    cleaned_words.append({
        "id": len(cleaned_words) + 1,
        "word": w_str,
        "reading": r_str,
        "han_viet": hv_str,
        "word_type": w_type,
        "meaning": m_str or f"Từ vựng N2 ({w_type})",
        "examples": ex_list
    })

total_words = len(cleaned_words)
print(f"\nFinal cleaned total words: {total_words}")

DAY_TITLES = [
    "BUỔI 1: N2 Động từ (Phần 1)",
    "BUỔI 2: N2 Động từ (Phần 2)",
    "BUỔI 3: N2 Động từ & Động danh từ (Suru Verbs)",
    "BUỔI 4: N2 Động danh từ & Danh từ (Phần 1)",
    "BUỔI 5: N2 Danh từ (Phần 2)",
    "BUỔI 6: N2 Danh từ, Tính từ -i & Tính từ -na",
    "BUỔI 7: N2 Phó từ, Từ nối & Động từ ghép",
    "BUỔI 8: N2 Katakana & Từ vựng tổng hợp",
    "BUỔI 9: N2 Phân biệt từ vựng & Tiền tố - Hậu tố (Phần 1)",
    "BUỔI 10: N2 Tiền tố - Hậu tố (Phần 2) & Ôn tập tổng hợp"
]

words_per_day = total_words // 10
remainder = total_words % 10

output_dir = os.path.join('src', 'data')
os.makedirs(output_dir, exist_ok=True)

# Clean existing lesson_*.json in src/data
for fname in os.listdir(output_dir):
    if fname.startswith('lesson_') and fname.endswith('.json'):
        os.remove(os.path.join(output_dir, fname))

curr_idx = 0
total_written = 0

for day in range(1, 11):
    count_today = words_per_day + (1 if day <= remainder else 0)
    day_words = cleaned_words[curr_idx : curr_idx + count_today]
    curr_idx += count_today

    formatted_words = []
    for widx, w in enumerate(day_words, start=1):
        formatted_words.append({
            "id": widx,
            "word": w["word"],
            "reading": w["reading"],
            "han_viet": w["han_viet"],
            "word_type": w["word_type"],
            "meaning": w["meaning"],
            "examples": w["examples"]
        })

    day_title = DAY_TITLES[day - 1]
    lesson_id = f"lesson_{day:02d}"
    file_name = f"lesson_{day:02d}.json"
    file_path = os.path.join(output_dir, file_name)

    output_json = {
        "lesson_id": lesson_id,
        "lesson_name": day_title,
        "level": "N2",
        "words": formatted_words
    }

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(output_json, f, ensure_ascii=False, indent=2)

    total_written += len(formatted_words)
    print(f"Generated {file_name}: {day_title} ({len(formatted_words)} words)")

print(f"\nSuccessfully generated 10 Daily Lessons ({total_written} total words written to src/data).")
