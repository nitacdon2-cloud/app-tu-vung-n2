import pymupdf as fitz
import os
import re
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = os.path.join('FILE SÁCH KANJI - TV - NP N2 (PDF)', 'PDF TỪ VỰNG N2', 'N2 - từ vựng 201223.pdf')
doc = fitz.open(pdf_path)

print(f"Total pages: {len(doc)}")

# Check pages 1-10 to see Table of Contents or intro pages
for i in range(min(10, len(doc))):
    print(f"--- PAGE {i+1} ---")
    print(doc[i].get_text("text")[:400])
