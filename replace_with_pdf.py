"""
Remplace les images de produits spécifiques par celles du cat-alfa.pdf.
"""
import fitz, re
from io import BytesIO
from PIL import Image

PROJECT = '/Users/erwanmegevand/Downloads/ALFA-V3-PROPRE'
PDF_PATH = f'{PROJECT}/cat-alfa.pdf'
IMAGES_DIR = f'{PROJECT}/images'

# Produits à traiter : (SKU_sans_diese, keywords_page)
targets = [
    ('KFOLEALM1962C', ['M1 9006', 'KIT LED ALFA M1 9006 Bicolor', 'KFOLEALM1962C']),
    ('PFMLEALC541B',  ['C5-41', 'MINIATURA LED ALFA C5', 'PFMLEALC541B']),
    ('PBAALSL300R',   ['SLIM RECTA 2X50', 'BARRA SLIM RECTA', 'PBAALSL300R']),
]

doc = fitz.open(PDF_PATH)

def extract_best_image_from_page(page):
    """Extract the largest high-quality image from a PDF page."""
    image_list = page.get_images(full=True)
    best = None
    best_size = 0
    for img_info in image_list:
        xref = img_info[0]
        try:
            base = doc.extract_image(xref)
            img_bytes = base['image']
            if len(img_bytes) <= 5000:
                continue
            pil = Image.open(BytesIO(img_bytes)).convert('RGB')
            w, h = pil.size
            if w < 100 or h < 100:
                continue
            if len(img_bytes) > best_size:
                best_size = len(img_bytes)
                best = (img_bytes, pil, base)
        except:
            pass
    return best

for sku, keywords in targets:
    print(f"\n--- {sku} ---")
    found_page = None

    for pn in range(doc.page_count):
        text = doc[pn].get_text()
        if any(kw.lower() in text.lower() for kw in keywords):
            found_page = pn
            print(f"  Trouvé à la page {pn + 1}")
            break

    if found_page is None:
        print(f"  ✗ Non trouvé dans le PDF")
        continue

    # Try this page and adjacent pages
    for adj_pn in [found_page, found_page - 1, found_page + 1]:
        if 0 <= adj_pn < doc.page_count:
            result = extract_best_image_from_page(doc[adj_pn])
            if result:
                img_bytes, pil, base = result
                w, h = pil.size
                # Convert to JPEG
                buf = BytesIO()
                pil.save(buf, 'JPEG', quality=92)
                jpg_bytes = buf.getvalue()

                dest = f'{IMAGES_DIR}/{sku}.jpg'
                with open(dest, 'wb') as f:
                    f.write(jpg_bytes)
                print(f"  ✓ REMPLACÉ: {sku}.jpg ({w}x{h}px, {len(jpg_bytes)//1024}KB) [p.{adj_pn+1}]")
                break
    else:
        print(f"  ✗ Aucune image valide trouvée autour de la page {found_page + 1}")
