"""
ÉTAPES 2, 3 et 4 — Extraction depuis cat-alfa.pdf, images_alfaperf/ et rapport final.
"""
import fitz  # PyMuPDF
import os, re, shutil
from datetime import datetime
from io import BytesIO
from PIL import Image

PROJECT    = '/Users/erwanmegevand/Downloads/ALFA-V3-PROPRE'
PDF_PATH   = os.path.join(PROJECT, 'cat-alfa.pdf')
IMAGES_DIR = os.path.join(PROJECT, 'images')
ALFAPERF   = os.path.join(PROJECT, 'images_alfaperf')
RAW_DIR    = os.path.join(PROJECT, 'pdf_images_raw')
REPORT     = os.path.join(PROJECT, 'rapport_images_final.txt')
MISSING_F  = os.path.join(PROJECT, 'images_manquantes_final.txt')

os.makedirs(RAW_DIR, exist_ok=True)

# Read the sans_image list
sans_image = open(os.path.join(PROJECT, 'sans_image.txt')).read().splitlines()
print(f"Produits sans image : {len(sans_image)}")
print(f"SKUs : {sans_image}\n")

# ── ÉTAPE 2 — Extraire images du PDF ───────────────────────────────────────
print("=== ÉTAPE 2 — Extraction depuis cat-alfa.pdf ===")
doc = fitz.open(PDF_PATH)
print(f"PDF : {doc.page_count} pages\n")

# Build index: sku -> list of (image_bytes, ext, size, page_num)
pdf_sku_images = {}

def save_raw(sku, base_image, page_num, idx):
    """Save raw image to pdf_images_raw/; returns path or None."""
    img_bytes = base_image['image']
    ext = base_image.get('ext', 'jpg')
    
    # Convert to JPEG if needed, check min size
    try:
        pil = Image.open(BytesIO(img_bytes)).convert('RGB')
        w, h = pil.size
        if w < 100 or h < 100:
            return None  # Too small — icon/logo
        buf = BytesIO()
        pil.save(buf, format='JPEG', quality=90)
        img_bytes = buf.getvalue()
    except Exception as e:
        return None

    fname = f"{sku}_{idx}.jpg"
    fpath = os.path.join(RAW_DIR, fname)
    with open(fpath, 'wb') as f:
        f.write(img_bytes)
    return fpath

for page_num in range(doc.page_count):
    page = doc[page_num]
    text = page.get_text()
    
    # Find all SKUs on this page (pattern: # followed by uppercase letters+digits+dots+dashes)
    found_skus_on_page = re.findall(r'#([A-Z0-9][A-Z0-9.\-]{3,})', text)
    # Also try to match SKUs from sans_image directly in extended text
    matched_skus = set()
    for sku in sans_image:
        if sku in text or f'#{sku}' in text:
            matched_skus.add(sku)
    for raw in found_skus_on_page:
        if raw in sans_image:
            matched_skus.add(raw)

    if not matched_skus:
        continue

    image_list = page.get_images(full=True)
    if not image_list:
        continue

    # Extract all qualifying images from this page
    page_imgs = []
    for img_info in image_list:
        xref = img_info[0]
        try:
            base_image = doc.extract_image(xref)
            size = len(base_image['image'])
            if size > 5000:
                page_imgs.append((size, base_image))
        except:
            pass
    
    page_imgs.sort(key=lambda x: x[0], reverse=True)  # Largest first

    for sku in matched_skus:
        if sku not in pdf_sku_images:
            pdf_sku_images[sku] = []
        for idx, (sz, base_image) in enumerate(page_imgs):
            p = save_raw(sku, base_image, page_num + 1, idx)
            if p:
                pdf_sku_images[sku].append((sz, p, page_num + 1))

total_pdf_imgs = sum(len(v) for v in pdf_sku_images.values())
print(f"Images extraites du PDF pour nos SKUs : {total_pdf_imgs}")
print(f"SKUs trouvés dans le PDF : {list(pdf_sku_images.keys())}\n")

# ── ÉTAPE 3 — Copier dans ./images/ ────────────────────────────────────────
print("=== ÉTAPE 3 — Cross-match et copie ===")
from_alfaperf = []
from_pdf      = []
still_missing = []

for sku in sans_image:
    dest = os.path.join(IMAGES_DIR, f"{sku}.jpg")

    # 1. Priorité : images_alfaperf/
    src_ap = os.path.join(ALFAPERF, f"{sku}.jpg")
    if os.path.exists(src_ap):
        shutil.copy2(src_ap, dest)
        print(f"  [alfaperf] ✓ {sku}.jpg")
        from_alfaperf.append(sku)
        continue

    # 2. Extraites du PDF
    if sku in pdf_sku_images and pdf_sku_images[sku]:
        # Take the largest image saved
        best = max(pdf_sku_images[sku], key=lambda x: x[0])
        shutil.copy2(best[1], dest)
        print(f"  [pdf p.{best[2]}] ✓ {sku}.jpg")
        from_pdf.append(sku)
        continue

    # 3. Nothing found
    print(f"  [manquant] ✗ {sku}")
    still_missing.append(sku)

# ── ÉTAPE 4 — Rapport ───────────────────────────────────────────────────────
avec_image_count = 379  # from étape 1
sans_image_count = len(sans_image)

now = datetime.now().strftime("%Y-%m-%d %H:%M")
report = f"""=== RAPPORT MISE À JOUR IMAGES ===
Date : {now}

ÉTAPE 1 — État initial
  Produits avec image : {avec_image_count}
  Produits sans image : {sans_image_count}

ÉTAPE 3 — Sources utilisées
  Copiés depuis images_alfaperf/ : {len(from_alfaperf)} SKUs
  Extraits depuis cat-alfa.pdf   : {len(from_pdf)} SKUs
  Toujours manquants             : {len(still_missing)} SKUs

IMAGES TOUJOURS MANQUANTES (voir images_manquantes_final.txt) :
  {chr(10).join('  ' + s for s in still_missing) if still_missing else '  Aucune — tout est résolu !'}
"""
with open(REPORT, 'w') as f:
    f.write(report)
with open(MISSING_F, 'w') as f:
    f.write('\n'.join(still_missing))

print(f"\n=== RAPPORT FINAL ===")
print(report)
