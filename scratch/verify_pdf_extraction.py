import pymupdf as fitz
import os
import re
import sys
import json

sys.path.insert(0, os.path.abspath('.'))
sys.stdout.reconfigure(encoding='utf-8')

pdf_path = os.path.join('FILE SÁCH KANJI - TV - NP N2 (PDF)', 'PDF TỪ VỰNG N2', 'N2 - từ vựng 201223.pdf')
doc = fitz.open(pdf_path)

print(f"Total pages: {len(doc)}")

from extract_vocab_v5 import extract_vocab_from_pdf, run_automated_auditor

temp_out = 'temp_v5_out'
os.makedirs(temp_out, exist_ok=True)
extract_vocab_from_pdf(pdf_path, temp_out)

v5_words = []
v5_by_lesson = {}
for fname in sorted(os.listdir(temp_out)):
    if fname.endswith('.json'):
        with open(os.path.join(temp_out, fname), 'r', encoding='utf-8') as f:
            data = json.load(f)
            wlist = data.get("words", [])
            v5_words.extend(wlist)
            v5_by_lesson[fname] = len(wlist)

print(f"\nTotal extracted by v5 across all 51 sub-lessons: {len(v5_words)}")

# Now let's check current src/data
src_words = []
src_by_lesson = {}
src_dir = os.path.join('src', 'data')
for fname in sorted(os.listdir(src_dir)):
    if fname.endswith('.json'):
        with open(os.path.join(src_dir, fname), 'r', encoding='utf-8') as f:
            data = json.load(f)
            wlist = data.get("words", [])
            src_words.extend(wlist)
            src_by_lesson[fname] = len(wlist)

print(f"Total words currently in src/data (10 lessons): {len(src_words)}")
