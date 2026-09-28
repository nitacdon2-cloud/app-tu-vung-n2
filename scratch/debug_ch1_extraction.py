import pymupdf as fitz
import os, sys, re, json

sys.stdout.reconfigure(encoding='utf-8')
pdf_path = os.path.join('FILE SÁCH KANJI - TV - NP N2 (PDF)', 'PDF TỪ VỰNG N2', 'N2 - từ vựng 201223.pdf')
doc = fitz.open(pdf_path)

# Inspect page 3 (first vocab page of Chapter 1)
page = doc[2] # Page 3
words = page.get_text('words')

# Filter out main words
main_words = [w for w in words if (w[3] - w[1]) >= 7.0]

# Find ID items (column 0)
id_items = []
for w in main_words:
    if 30 <= w[0] <= 100 and 60 <= w[1] <= 800:
        txt = w[4].strip()
        if txt.isdigit():
            id_items.append((int(txt), w[1], w[3]))

id_items.sort(key=lambda x: x[1])

print(f"Page 3 ID items count: {len(id_items)}")
for i, (item_id, id_y0, id_y1) in enumerate(id_items):
    top_b = id_y0 - 20 if i == 0 else (id_items[i-1][1] + id_y0) / 2
    bot_b = 780 if i + 1 == len(id_items) else (id_y0 + id_items[i+1][1]) / 2
    
    row_words = [w for w in main_words if top_b <= w[1] < bot_b]
    
    w_toks = [w for w in row_words if 85 <= w[0] < 130]
    r_toks = [w for w in row_words if 130 <= w[0] < 192]
    m_toks = [w for w in row_words if 192 <= w[0] < 275]
    ex_toks = [w for w in row_words if w[0] >= 275]
    
    w_str = ' '.join([w[4] for w in sorted(w_toks, key=lambda k: (k[1], k[0]))])
    r_str = ' '.join([w[4] for w in sorted(r_toks, key=lambda k: (k[1], k[0]))])
    m_str = ' '.join([w[4] for w in sorted(m_toks, key=lambda k: (k[1], k[0]))])
    
    # Sort ex_toks by y0, then x0
    ex_lines = []
    for w in sorted(ex_toks, key=lambda k: (k[1], k[0])):
        if not ex_lines or abs(w[1] - ex_lines[-1]['y']) > 3.5:
            ex_lines.append({'y': w[1], 'words': [w]})
        else:
            ex_lines[-1]['words'].append(w)
            
    print(f"\nItem #{item_id}: Word='{w_str}' | Reading='{r_str}' | Meaning='{m_str}'")
    print(f"  Ex Lines ({len(ex_lines)} lines):")
    for el in ex_lines:
        words_in_l = sorted(el['words'], key=lambda k: k[0])
        l_str = ""
        prev_x1 = None
        for w in words_in_l:
            if not l_str:
                l_str = w[4]
            elif (w[0] - prev_x1) > 1.0:
                l_str += ' ' + w[4]
            else:
                l_str += w[4]
            prev_x1 = w[2]
        print(f"    y={el['y']:.1f}: {l_str}")
