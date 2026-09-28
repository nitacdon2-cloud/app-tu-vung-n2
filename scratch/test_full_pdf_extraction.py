import pymupdf as fitz
import os
import re
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = os.path.join('FILE SÁCH KANJI - TV - NP N2 (PDF)', 'PDF TỪ VỰNG N2', 'N2 - từ vựng 201223.pdf')
doc = fitz.open(pdf_path)

print(f"Total pages: {len(doc)}")

# Let's inspect IDs in pages 3-124 (Chapters 1-9)
all_ids_found = {}

for page_idx in range(2, 124):
    page_num = page_idx + 1
    page = doc[page_idx]
    words = page.get_text('words')
    main_words = [w for w in words if (w[3] - w[1]) >= 7.5]
    
    # Find pure integer ID items in x range 30 to 100
    for w in main_words:
        if 30 <= w[0] <= 100 and 80 <= w[1] <= 800:
            txt = w[4].strip()
            if txt.isdigit():
                num = int(txt)
                if num not in all_ids_found:
                    all_ids_found[num] = (page_num, w[1])

sorted_ids = sorted(all_ids_found.keys())
print(f"Total unique ID numbers found in Chapters 1-9: {len(sorted_ids)}")
print(f"ID Range: {sorted_ids[0]} to {sorted_ids[-1]}")

# Check missing numbers in 1..1225
missing_numbers = [i for i in range(1, sorted_ids[-1] + 1) if i not in all_ids_found]
print(f"Missing ID numbers in range 1..{sorted_ids[-1]}: {len(missing_numbers)}")
if missing_numbers:
    print(f"First 20 missing IDs: {missing_numbers[:20]}")
