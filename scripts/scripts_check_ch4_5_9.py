import fitz
import sys
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'c:\Users\k.trinh.minh.trai\Documents\YouTube\2. VIP 15 N2_HỌC VIÊN\1. CHẶNG 1 (KIẾN THỨC NỀN TẢNG N2)\FILE SÁCH KANJI - TV - NP N2 (PDF)\PDF TỪ VỰNG N2\N2 - từ vựng 201223.pdf'
doc = fitz.open(pdf_path)

# Check P85-88 (Chapter 4)
print("=== Chapter 4 (P85-88) ===")
for p in range(84, 88):
    text = doc[p].get_text()
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    print(f"P{p+1}: {lines[:6]}")

# Check P89-93 (Chapter 5)
print("=== Chapter 5 (P89-93) ===")
for p in range(88, 93):
    text = doc[p].get_text()
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    print(f"P{p+1}: {lines[:6]}")

# Check P123-124 (Chapter 9)
print("=== Chapter 9 (P123-124) ===")
for p in range(122, 124):
    text = doc[p].get_text()
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    print(f"P{p+1}: {lines[:6]}")
