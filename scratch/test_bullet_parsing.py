import pymupdf as fitz
import os, sys, re, json, pykakasi

sys.stdout.reconfigure(encoding='utf-8')
kks = pykakasi.kakasi()

pdf_path = os.path.join('FILE SÁCH KANJI - TV - NP N2 (PDF)', 'PDF TỪ VỰNG N2', 'N2 - từ vựng 201223.pdf')
doc = fitz.open(pdf_path)

def get_hira(text):
    if not text: return ""
    res = kks.convert(text)
    return ''.join([r['hira'] for r in res])

def clean_txt(t):
    if not t: return ''
    t = t.replace('\r', '').replace('\n', ' ').strip()
    t = re.sub(r'\s+', ' ', t)
    return t

# Inspect Page 3 with bullet-associative example parser
page = doc[2] # Page 3
words = page.get_text('words')

# Main words (font size main, height >= 7.0)
main_words = [w for w in words if (w[3] - w[1]) >= 7.0]

# Find ID items (column 0)
id_items = []
for w in main_words:
    if 30 <= w[0] <= 100 and 60 <= w[1] <= 800:
        txt = w[4].strip()
        if txt.isdigit():
            id_items.append((int(txt), w[1], w[3]))

id_items.sort(key=lambda x: x[1])

# Extract all example box lines (x0 >= 270) across the whole page!
ex_words = [w for w in main_words if w[0] >= 270]
ex_words.sort(key=lambda k: (k[1], k[0]))

ex_lines = []
for w in ex_words:
    if not ex_lines or abs(w[1] - ex_lines[-1]['y']) > 3.5:
        ex_lines.append({'y': w[1], 'words': [w]})
    else:
        ex_lines[-1]['words'].append(w)

page_ex_blocks = []
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
    l_str = clean_txt(l_str)
    page_ex_blocks.append({'y': el['y'], 'text': l_str})

# Group page_ex_blocks into individual examples starting with '・' or Japanese text
examples_all = []
curr_ex = None

for b in page_ex_blocks:
    txt = b['text']
    if txt.startswith('・') or (not curr_ex and any('\u4e00' <= c <= '\u9fff' or '\u3040' <= c <= '\u30ff' for c in txt)):
        if curr_ex:
            examples_all.append(curr_ex)
        curr_ex = {'start_y': b['y'], 'end_y': b['y'], 'ja': [txt], 'vi': []}
    else:
        if curr_ex:
            has_ja = any('\u4e00' <= c <= '\u9fff' or '\u3040' <= c <= '\u30ff' for c in txt)
            if has_ja and not curr_ex['vi']:
                curr_ex['ja'].append(txt)
            else:
                curr_ex['vi'].append(txt)
            curr_ex['end_y'] = b['y']

if curr_ex:
    examples_all.append(curr_ex)

print(f"Total examples grouped on page 3: {len(examples_all)}")
for idx, ex in enumerate(examples_all, 1):
    ja_text = clean_txt(' '.join(ex['ja']))
    vi_text = clean_txt(' '.join(ex['vi']))
    print(f"[{idx}] y={ex['start_y']:.1f}-{ex['end_y']:.1f}: JA='{ja_text}' => VI='{vi_text}'")
