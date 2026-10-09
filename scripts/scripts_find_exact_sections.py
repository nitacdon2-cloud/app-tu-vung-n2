import fitz
import sys
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'c:\Users\k.trinh.minh.trai\Documents\YouTube\2. VIP 15 N2_HỌC VIÊN\1. CHẶNG 1 (KIẾN THỨC NỀN TẢNG N2)\FILE SÁCH KANJI - TV - NP N2 (PDF)\PDF TỪ VỰNG N2\N2 - từ vựng 201223.pdf'
doc = fitz.open(pdf_path)

# Let's inspect page by page all section markings
# In each page, look for chapter and section headings
for p_idx in range(2, len(doc)):
    page_num = p_idx + 1
    text = doc[p_idx].get_text()
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    
    # Check all lines for section numbers
    sec_candidates = []
    for l in lines:
        m = re.search(r'(\d+\.\d+)', l)
        if m:
            sec_candidates.append(l)
        if 'い形容詞' in l or 'まとめ' in l or '章' in l:
            sec_candidates.append(l)
    
    # Let's print out if any line has \d+\.\d+ or Chapter header
    sec_matches = [l for l in sec_candidates if re.search(r'^\d+\.\d+$|\b\d+\.\d+\s*[-–]|\b動詞\s*\d+\.\d+|\b動名詞\s*\d+\.\d+|\b名詞\s*\d+\.\d+|\b形容詞\s*\d+\.\d+|\b副詞.*?\d+\.\d+|\b複合動詞\s*\d+\.\d+|\bカタカナ\s*\d+\.\d+|4\s*い形容詞|まとめ\s*9', l)]
    if sec_matches:
        print(f"P{page_num:3d}: {sec_matches}")
