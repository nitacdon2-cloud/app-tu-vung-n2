import pymupdf as fitz
import sys
import os
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = os.path.join('FILE SÁCH KANJI - TV - NP N2 (PDF)', 'PDF TỪ VỰNG N2', 'N2 - từ vựng 201223.pdf')
doc = fitz.open(pdf_path)

def parse_ch10_page(page):
    # Get text blocks or words sorted vertically
    blocks = page.get_text("blocks")
    lines = []
    for b in blocks:
        block_text = b[4].strip()
        if block_text:
            for line in block_text.splitlines():
                l = line.strip()
                if l:
                    lines.append(l)
    return lines

# Test on page 125 (0-indexed 124)
lines = parse_ch10_page(doc[124])
print("=== PAGE 125 LINES ===")
for i, l in enumerate(lines[:40]):
    print(f"{i}: {l}")
