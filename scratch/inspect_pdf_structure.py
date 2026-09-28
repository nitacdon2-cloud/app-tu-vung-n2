import pymupdf as fitz
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = os.path.join('FILE SÁCH KANJI - TV - NP N2 (PDF)', 'PDF TỪ VỰNG N2', 'N2 - từ vựng 201223.pdf')
doc = fitz.open(pdf_path)

print(f"Total PDF pages: {len(doc)}")

# Let's inspect headings, chapter markers, table titles, item numbers across all pages
chapters = []
all_numbered_items = []

for page_idx in range(len(doc)):
    page = doc[page_idx]
    text = page.get_text("text")
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    # Check for chapter titles or section headings
    for line in lines:
        if re.search(r'第\s*\d+\s*章|章|Bài|Buổi|Bài\s*\d+|Lần\s*\d+|DAY\s*\d+', line, re.IGNORECASE):
            # print page and line
            if len(line) < 50:
                chapters.append((page_idx + 1, line))
        
        # Check for item numbers like 1, 2, 3... or 0001, 002...
        # In vocabulary books (like Shinkanzen, Sou Matome, Mimi Kara Oboeru), items often have numbers.
        # Let's see if there are numbers.

print("\n--- Detected Headings / Chapter Markers ---")
for p, heading in chapters[:50]:
    print(f"Page {p}: {heading}")
if len(chapters) > 50:
    print(f"... total {len(chapters)} chapter markers found")
