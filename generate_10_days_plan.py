"""
generate_10_days_plan.py

Restructures the 1,312 total N2 Vocabulary items into a perfectly balanced 10-Day Intensive Study Plan.
Each day contains ~131 words, organized sequentially by word type / topic:

Day 01: NGÀY 1 - N2 Động từ (Phần 1) [131 từ]
Day 02: NGÀY 2 - N2 Động từ (Phần 2) [131 từ]
Day 03: NGÀY 3 - N2 Động từ & Động danh từ (Suru Verbs) [131 từ]
Day 04: NGÀY 4 - N2 Động danh từ & Danh từ (Phần 1) [131 từ]
Day 05: NGÀY 5 - N2 Danh từ (Phần 2) [131 từ]
Day 06: NGÀY 6 - N2 Danh từ, Tính từ & Phó từ (Phần 1) [131 từ]
Day 07: NGÀY 7 - N2 Phó từ & Động từ ghép [131 từ]
Day 08: NGÀY 8 - N2 Katakana & Từ vựng ngoại lai [131 từ]
Day 09: NGÀY 9 - N2 Phân biệt từ vựng & Tiền tố - Hậu tố (Phần 1) [131 từ]
Day 10: NGÀY 10 - N2 Tiền tố - Hậu tố (Phần 2) & Tổng hợp [133 từ]
"""
import os
import json
import shutil
import re

DAY_TITLES = [
    "NGÀY 1: N2 Động từ (Phần 1)",
    "NGÀY 2: N2 Động từ (Phần 2)",
    "NGÀY 3: N2 Động từ & Động danh từ (Suru Verbs)",
    "NGÀY 4: N2 Động danh từ & Danh từ (Phần 1)",
    "NGÀY 5: N2 Danh từ (Phần 2)",
    "NGÀY 6: N2 Danh từ, Tính từ & Phó từ (Phần 1)",
    "NGÀY 7: N2 Phó từ & Động từ ghép",
    "NGÀY 8: N2 Katakana & Từ vựng ngoại lai",
    "NGÀY 9: N2 Phân biệt từ vựng & Tiền tố - Hậu tố (Phần 1)",
    "NGÀY 10: N2 Tiền tố - Hậu tố (Phần 2) & Tổng hợp"
]

def build_balanced_10_day_plan():
    from extract_vocab_modular import process_pdf
    
    temp_dir = 'temp_extracted_subsections'
    pdf_file = os.path.join(
        'FILE SÁCH KANJI - TV - NP N2 (PDF)',
        'PDF TỪ VỰNG N2',
        'N2 - từ vựng 201223.pdf'
    )
    process_pdf(pdf_file, temp_dir)

    # Collect all words in ordered list of subsections
    # Natural sort helper for subsection keys like 1.1, 1.2, ..., 1.10, 2.1, etc.
    def sub_sort_key(filename):
        m = re.search(r'lesson_(\d+)\.json', filename)
        if m:
            return int(m.group(1))
        return 0

    json_files = sorted([f for f in os.listdir(temp_dir) if f.endswith('.json')], key=sub_sort_key)
    
    all_extracted_words = []
    
    for fname in json_files:
        filepath = os.path.join(temp_dir, fname)
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            words = data.get("words", [])
            all_extracted_words.extend(words)

    total_words = len(all_extracted_words)
    print(f"Total extracted words: {total_words}")

    # Divide total_words into 10 chunks evenly
    words_per_day = total_words // 10
    remainder = total_words % 10

    output_dir = os.path.join('src', 'data')
    # Clean existing json files in src/data
    for fname in os.listdir(output_dir):
        if fname.endswith('.json'):
            os.remove(os.path.join(output_dir, fname))

    print("\n==================================================")
    print("CREATING 10 EQUALLY BALANCED DAILY LESSONS")
    print("==================================================")

    curr_idx = 0
    total_written = 0

    for day in range(1, 11):
        # Distribute remainder to last few days or first few days
        count_today = words_per_day + (1 if day > (10 - remainder) else 0)
        day_words = all_extracted_words[curr_idx : curr_idx + count_today]
        curr_idx += count_today

        # Re-index words 1..N
        formatted_words = []
        for idx, w in enumerate(day_words, start=1):
            formatted_words.append({
                "id": idx,
                "word": w.get("word", ""),
                "reading": w.get("reading", ""),
                "han_viet": w.get("han_viet", ""),
                "word_type": w.get("word_type", "Từ vựng"),
                "meaning": w.get("meaning", ""),
                "examples": w.get("examples", [])
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

    print(f"\nSuccessfully generated 10-Day Plan ({total_written} total words).")

    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)

if __name__ == '__main__':
    build_balanced_10_day_plan()
