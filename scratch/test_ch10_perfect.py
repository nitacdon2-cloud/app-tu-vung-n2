import pymupdf as fitz
import sys
import os
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = os.path.join('FILE SÁCH KANJI - TV - NP N2 (PDF)', 'PDF TỪ VỰNG N2', 'N2 - từ vựng 201223.pdf')
doc = fitz.open(pdf_path)

def extract_ch10_words():
    ch10_results = []
    
    # Pages 125 to 139 (0-indexed 124 to 138)
    for p_idx in range(124, 139):
        page = doc[p_idx]
        words = page.get_text("words")
        
        # Detect section title e.g. 10.1 - あっさり・さっぱり・すっかり
        sec_title = f"10.{(p_idx-124)//2 + 1}"
        for w in words:
            if w[1] < 100 and ('10.' in w[4] or '章' in w[4]):
                if '10.' in w[4]:
                    sec_title = w[4].strip()
        
        # Group into lines
        lines = []
        for w in sorted(words, key=lambda k: (k[1], k[0])):
            x0, y0, x1, y1, txt = w[0], w[1], w[2], w[3], w[4].strip()
            if not txt or (y1 - y0) < 7.0 or y0 < 100: # skip headers & furigana
                continue
            found = False
            for line in lines:
                if abs(line['y'] - y0) < 4.0:
                    line['words'].append((x0, x1, txt))
                    found = True
                    break
            if not found:
                lines.append({'y': y0, 'words': [(x0, x1, txt)]})

        line_objs = []
        for line in sorted(lines, key=lambda l: l['y']):
            w_sorted = sorted(line['words'], key=lambda k: k[0])
            x0_first = w_sorted[0][0]
            full_str = ''.join([w[2] for w in w_sorted])
            line_objs.append({'y': line['y'], 'x0': x0_first, 'text': full_str, 'words': w_sorted})

        # Main words are at x0 < 110
        main_word_lines = [l for l in line_objs if l['x0'] < 110 and not l['text'].startswith('・')]
        
        for i, mw_line in enumerate(main_word_lines):
            y_curr = mw_line['y']
            y_next = main_word_lines[i+1]['y'] if i+1 < len(main_word_lines) else 800
            
            w_str = mw_line['text']
            
            # Meaning lines are in y range [y_curr - 30, y_next] and 110 <= x0 < 280
            meaning_lines = [
                l['text'] for l in line_objs 
                if (y_curr - 40 <= l['y'] < y_next) and (110 <= l['x0'] < 280) and not l['text'].startswith('・')
            ]
            
            # Filter and clean meanings
            meaning_str = ' '.join(meaning_lines).strip()
            meaning_str = re.sub(r'\s+', ' ', meaning_str)
            
            if w_str:
                ch10_results.append({
                    "word": w_str,
                    "section": sec_title,
                    "meaning": meaning_str
                })

    return ch10_results

results = extract_ch10_words()
print(f"Total Chapter 10 words extracted: {len(results)}")
for r in results[:15]:
    print(f"[{r['section']}] {r['word']} -> {r['meaning']}")
