import pymupdf as fitz
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = os.path.join('FILE SÁCH KANJI - TV - NP N2 (PDF)', 'PDF TỪ VỰNG N2', 'N2 - từ vựng 201223.pdf')
doc = fitz.open(pdf_path)

print(f"Total PDF pages: {len(doc)}")

# Let's inspect page by page what chapter and subsection is detected, and how many ID items (words) are found on each page!
current_ch = "1"
current_sub = "1.1"

pages_summary = []

for idx in range(len(doc)):
    page_num = idx + 1
    page = doc[idx]
    words = page.get_text('words')
    main_words = [w for w in words if (w[3] - w[1]) >= 7.5]
    
    # Top words
    top_words = [w for w in main_words if w[1] < 120]
    page_text = ' '.join([w[4] for w in sorted(top_words, key=lambda k: (k[1], k[0]))])
    
    ch_match = re.search(r'(\d{1,2})\s*章', page_text)
    if ch_match:
        current_ch = ch_match.group(1)
    
    sub_match = re.search(r'(\d{1,2}\.\d{1,2})', page_text)
    if sub_match:
        current_sub = sub_match.group(1)
        
    # Count integer IDs on page
    id_items = []
    for w in main_words:
        if 30 <= w[0] <= 100 and 80 <= w[1] <= 800:
            txt = w[4].strip()
            if txt.isdigit():
                id_items.append((int(txt), w[1]))
                
    id_items.sort(key=lambda x: x[1])
    unique_ids = []
    for item in id_items:
        if not unique_ids or abs(item[1] - unique_ids[-1][1]) > 10:
            unique_ids.append(item)
            
    pages_summary.append({
        "page": page_num,
        "ch": current_ch,
        "sub": current_sub,
        "raw_sub_match": sub_match.group(1) if sub_match else None,
        "raw_ch_match": ch_match.group(1) if ch_match else None,
        "id_count": len(unique_ids),
        "ids": [u[0] for u in unique_ids]
    })

print(f"{'Page':<5} | {'Ch':<4} | {'Sub':<6} | {'ChMatch':<8} | {'SubMatch':<9} | {'IDs Count':<10} | {'IDs Range'}")
print("-" * 75)
for p in pages_summary:
    ids_range = f"{p['ids'][0]}..{p['ids'][-1]}" if p['ids'] else "none"
    print(f"{p['page']:<5} | {p['ch']:<4} | {p['sub']:<6} | {str(p['raw_ch_match']):<8} | {str(p['raw_sub_match']):<9} | {p['id_count']:<10} | {ids_range}")
