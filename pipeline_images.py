"""
Pipeline complet:
  1. Identifier les SKUs sans image dans ./images/
  2. Copier depuis ./images_alfaperf/ (priorité)
  3. Extraire depuis cat-alfa.pdf
  4. Rapport final
"""
import fitz, hashlib, os, re, shutil
from datetime import datetime
from io import BytesIO
from PIL import Image

PROJECT    = '/Users/erwanmegevand/Downloads/ALFA-V3-PROPRE'
IMAGES_DIR = os.path.join(PROJECT, 'images')
ALFAPERF   = os.path.join(PROJECT, 'images_alfaperf')
PDF_PATH   = os.path.join(PROJECT, 'cat-alfa.pdf')
RAW_DIR    = os.path.join(PROJECT, 'pdf_images_raw')
os.makedirs(RAW_DIR, exist_ok=True)

# ── ÉTAPE 1 — Lister les SKUs sans image ────────────────────────────────────
catalog_js = open(os.path.join(PROJECT, 'catalog.js'), encoding='utf-8').read()
skus_raw = re.findall(r'sku:\s*"#([A-Z0-9.\-]+)"', catalog_js)
seen, unique_skus = set(), []
for s in skus_raw:
    if s not in seen:
        seen.add(s)
        unique_skus.append(s)

sans_image  = [s for s in unique_skus if not os.path.exists(os.path.join(IMAGES_DIR, s + '.jpg'))]
avec_image  = [s for s in unique_skus if     os.path.exists(os.path.join(IMAGES_DIR, s + '.jpg'))]

print(f"=== ÉTAPE 1 ===")
print(f"  Total SKUs  : {len(unique_skus)}")
print(f"  Avec image  : {len(avec_image)}")
print(f"  Sans image  : {len(sans_image)}")
print()
for s in sans_image:
    print(f"  - {s}")
print()

# ── ÉTAPE 2 — images_alfaperf/ ──────────────────────────────────────────────
print("=== ÉTAPE 2 — images_alfaperf/ ===")
from_alfaperf = []
still_missing = []

for sku in sans_image:
    src = os.path.join(ALFAPERF, f"{sku}.jpg")
    if os.path.exists(src):
        shutil.copy2(src, os.path.join(IMAGES_DIR, f"{sku}.jpg"))
        print(f"  [alfaperf] ✓ {sku}.jpg")
        from_alfaperf.append(sku)
    else:
        still_missing.append(sku)

print(f"\n  → {len(from_alfaperf)} copiés depuis images_alfaperf/")
print(f"  → {len(still_missing)} à chercher dans le PDF\n")

# ── ÉTAPE 3 — cat-alfa.pdf ──────────────────────────────────────────────────
print("=== ÉTAPE 3 — cat-alfa.pdf ===")

if still_missing:
    doc = fitz.open(PDF_PATH)
    print(f"  PDF : {doc.page_count} pages")

    pdf_sku_images = {}  # sku -> list of (size, img_bytes, page_num)

    for page_num in range(doc.page_count):
        page = doc[page_num]
        text = page.get_text()

        matched = set()
        for sku in still_missing:
            if sku in text or f'#{sku}' in text:
                matched.add(sku)
        for raw in re.findall(r'#([A-Z0-9][A-Z0-9.\-]{3,})', text):
            if raw in still_missing:
                matched.add(raw)

        if not matched:
            continue

        for img_info in page.get_images(full=True):
            xref = img_info[0]
            try:
                base = doc.extract_image(xref)
                img_bytes = base['image']
                if len(img_bytes) < 5000:
                    continue
                # Check min pixel size
                pil = Image.open(BytesIO(img_bytes)).convert('RGB')
                w, h = pil.size
                if w < 100 or h < 100:
                    continue
                # Convert to JPEG
                buf = BytesIO()
                pil.save(buf, 'JPEG', quality=90)
                jpg_bytes = buf.getvalue()

                for sku in matched:
                    if sku not in pdf_sku_images:
                        pdf_sku_images[sku] = []
                    pdf_sku_images[sku].append((len(jpg_bytes), jpg_bytes, page_num + 1))
            except:
                pass

    from_pdf = []
    final_missing = []

    for sku in still_missing:
        dest = os.path.join(IMAGES_DIR, f"{sku}.jpg")
        if sku in pdf_sku_images and pdf_sku_images[sku]:
            best = max(pdf_sku_images[sku], key=lambda x: x[0])
            with open(dest, 'wb') as f:
                f.write(best[1])
            print(f"  [pdf p.{best[2]}] ✓ {sku}.jpg")
            from_pdf.append(sku)
        else:
            print(f"  [manquant]  ✗ {sku}")
            final_missing.append(sku)
else:
    from_pdf = []
    final_missing = []
    print("  Rien à chercher dans le PDF.")

# ── RAPPORT ──────────────────────────────────────────────────────────────────
now = datetime.now().strftime("%Y-%m-%d %H:%M")
report = f"""=== RAPPORT MISE À JOUR IMAGES ===
Date : {now}

ÉTAPE 1 — État initial
  Produits avec image : {len(avec_image)}
  Produits sans image : {len(sans_image)}

ÉTAPE 2+3 — Sources utilisées
  Copiés depuis images_alfaperf/ : {len(from_alfaperf)} SKUs
  Extraits depuis cat-alfa.pdf   : {len(from_pdf)} SKUs
  Toujours manquants             : {len(final_missing)} SKUs

IMAGES TOUJOURS MANQUANTES :
{"  Aucune — tout est résolu !" if not final_missing else chr(10).join('  ' + s for s in final_missing)}
"""
with open(os.path.join(PROJECT, 'rapport_images_final.txt'), 'w') as f:
    f.write(report)
with open(os.path.join(PROJECT, 'images_manquantes_final.txt'), 'w') as f:
    f.write('\n'.join(final_missing))

print()
print(report)
