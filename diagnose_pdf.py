"""Zoom in on top of page 4 to find the missing word for ID 10"""
import sys
sys.stdout.reconfigure(encoding='utf-8')
import pymupdf as fitz

PDF_PATH = r"FILE SÁCH KANJI - TV - NP N2 (PDF)\PDF TỪ VỰNG N2\N2 - từ vựng 201223.pdf"
doc = fitz.open(PDF_PATH)

# Page 4 = index 3
page = doc[3]
words = page.get_text('words')

print("=== ALL CONTENT on page 4 (top y=0..200) ===")
top_words = sorted([w for w in words if w[1] < 200], key=lambda w: (w[1], w[0]))
for w in top_words:
    x0, y0, x1, y1, text = w[0], w[1], w[2], w[3], w[4]
    print(f"  y={y0:.0f} x={x0:.0f} '{text}'")

print("\n=== Bottom of page 3 (y=700..800) ===")
page3 = doc[2]
words3 = page3.get_text('words')
bot_words = sorted([w for w in words3 if w[1] > 700], key=lambda w: (w[1], w[0]))
for w in bot_words:
    x0, y0, x1, y1, text = w[0], w[1], w[2], w[3], w[4]
    print(f"  y={y0:.0f} x={x0:.0f} '{text}'")

doc.close()
