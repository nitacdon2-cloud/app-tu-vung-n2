import pymupdf as fitz
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = os.path.join('FILE SÁCH KANJI - TV - NP N2 (PDF)', 'PDF TỪ VỰNG N2', 'N2 - từ vựng 201223.pdf')
doc = fitz.open(pdf_path)

for pnum in range(125, 134):
    print(f"==================== PAGE {pnum} ====================")
    words = doc[pnum - 1].get_text('words')
    # sort by y, x
    words.sort(key=lambda w: (round(w[1]/5)*5, w[0]))
    current_y = None
    line = []
    for w in words:
        if current_y is None or abs(w[1] - current_y) > 3:
            if line:
                print(f"y={current_y:5.1f} | " + " ".join([item[4] for item in line]))
            line = [w]
            current_y = w[1]
        else:
            line.append(w)
    if line:
        print(f"y={current_y:5.1f} | " + " ".join([item[4] for item in line]))
