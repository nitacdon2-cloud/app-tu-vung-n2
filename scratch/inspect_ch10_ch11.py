import pymupdf as fitz
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = os.path.join('FILE SÁCH KANJI - TV - NP N2 (PDF)', 'PDF TỪ VỰNG N2', 'N2 - từ vựng 201223.pdf')
doc = fitz.open(pdf_path)

print(f"Total pages: {len(doc)}")

# Find pages for Chapter 10 and Chapter 11
for page_num in range(len(doc)):
    text = doc[page_num].get_text()
    if '10.1' in text or '11.1' in text or 'あっさり' in text or '不・無・非' in text:
        print(f"--- PAGE {page_num + 1} ---")
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        for l in lines[:20]:
            print("  ", l)
