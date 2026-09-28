import os
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')
sys.path.append('.')

from extract_vocab_modular import process_pdf

out_dir = 'scratch/test_out'
pdf_file = os.path.join('FILE SÁCH KANJI - TV - NP N2 (PDF)', 'PDF TỪ VỰNG N2', 'N2 - từ vựng 201223.pdf')
process_pdf(pdf_file, out_dir)

files = sorted([f for f in os.listdir(out_dir) if f.endswith('.json')])
total = 0
for f in files:
    with open(os.path.join(out_dir, f), 'r', encoding='utf-8') as fp:
        d = json.load(fp)
        w_cnt = len(d.get('words', []))
        total += w_cnt
        print(f"{f}: {d.get('lesson_name')} -> {w_cnt} words")

print(f"\nTOTAL WORDS EXTRACTED: {total}")
