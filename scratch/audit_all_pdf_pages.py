import pymupdf as fitz
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = os.path.join('FILE SÁCH KANJI - TV - NP N2 (PDF)', 'PDF TỪ VỰNG N2', 'N2 - từ vựng 201223.pdf')
doc = fitz.open(pdf_path)

print(f"Auditing all {len(doc)} pages of PDF...\n")

page_info = []

for idx, page in enumerate(doc):
    page_num = idx + 1
    text = page.get_text("text")
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    
    # Extract any headers like 1 章, 2 章, 3 章, etc. or section numbers like 1.1, 1.2, 3.2, 4.1...
    sec_matches = re.findall(r'(\d+\s*章|\d+\.\d+)', text)
    
    # Check for numbered items (like '1', '2', '31', etc. at the start of lines or words)
    # Let's extract blocks/words to see how entries are structured
    words_blocks = page.get_text("blocks")
    
    page_info.append({
        "page": page_num,
        "line_count": len(lines),
        "headers": sec_matches,
        "first_few_lines": lines[:6]
    })

print(f"{'Page':<6} | {'Headers/Sections':<30} | {'First Line'}")
print("-" * 80)
for p in page_info:
    hdrs = ", ".join(p['headers']) if p['headers'] else "(none)"
    first = p['first_few_lines'][0] if p['first_few_lines'] else ""
    # Only print pages where header changes or interesting info
    print(f"{p['page']:<6} | {hdrs:<30} | {first[:40]}")
