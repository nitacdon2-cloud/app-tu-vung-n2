import pymupdf as fitz
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = os.path.join('FILE SÁCH KANJI - TV - NP N2 (PDF)', 'PDF TỪ VỰNG N2', 'N2 - từ vựng 201223.pdf')
doc = fitz.open(pdf_path)

page = doc[125] # page 126
words = page.get_text("words")

lines = []
for w in sorted(words, key=lambda k: (k[1], k[0])):
    x0, y0, x1, y1, txt = w[0], w[1], w[2], w[3], w[4].strip()
    if not txt or (y1 - y0) < 7.0: # skip furigana
        continue
    found = False
    for line in lines:
        if abs(line['y'] - y0) < 4.0:
            line['words'].append((x0, x1, txt))
            found = True
            break
    if not found:
        lines.append({'y': y0, 'words': [(x0, x1, txt)]})

for line in sorted(lines, key=lambda l: l['y']):
    w_sorted = sorted(line['words'], key=lambda k: k[0])
    x0_first = w_sorted[0][0]
    full_str = ' '.join([w[2] for w in w_sorted])
    print(f"y={line['y']:.1f}, x0={x0_first:.1f} | {full_str}")
