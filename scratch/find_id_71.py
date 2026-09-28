import pymupdf as fitz
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = os.path.join('FILE SÁCH KANJI - TV - NP N2 (PDF)', 'PDF TỪ VỰNG N2', 'N2 - từ vựng 201223.pdf')
doc = fitz.open(pdf_path)

print("--- PAGE 10 TEXT ---")
print(doc[9].get_text("text"))

print("\n--- PAGE 10 WORDS ---")
for w in doc[9].get_text('words'):
    if '71' in w[4] or '払い込む' in w[4] or 'はらいこむ' in w[4]:
        print(w)
