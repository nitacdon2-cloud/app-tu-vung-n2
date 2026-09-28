import sys
import pymupdf
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'FILE SÁCH KANJI - TV - NP N2 (PDF)/PDF TỪ VỰNG N2/N2 - từ vựng 201223.pdf'
doc = pymupdf.open(pdf_path)

print(f'Opened PDF with {len(doc)} pages.')
