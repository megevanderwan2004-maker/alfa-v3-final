"""
Extracts product images from cat-alfa.pdf by matching page text to product names/SKUs.
Maps extracted images to correct SKU filenames and saves to ./images/
"""
import fitz  # PyMuPDF
import os
import json
import re
import shutil

PDF_PATH = "cat-alfa.pdf"
OUTPUT_DIR = "./images"

# Load catalog
catalog_js = open("catalog.js", "r", encoding="utf-8").read()
# Eval catalog items from JS — extract name, sku, imagePath
catalog = []
for m in re.finditer(r'\{[^{}]+nombre[^{}]+\}', catalog_js, re.DOTALL):
    item_str = m.group(0)
    nombre = re.search(r'nombre:\s*"([^"]+)"', item_str)
    sku = re.search(r'sku:\s*"([^"]+)"', item_str)
    imagePath = re.search(r'imagePath:\s*"([^"]+)"', item_str)
    if nombre and sku and imagePath:
        catalog.append({
            'nombre': nombre.group(1),
            'sku': sku.group(1).replace('#', ''),
            'imagePath': imagePath.group(1)
        })

print(f"Loaded {len(catalog)} catalog items")

# Find missing ones
missing = [p for p in catalog if not os.path.exists(p['imagePath'])]
print(f"Missing images: {len(missing)}")
for m in missing:
    print(f"  - {m['nombre']} ({m['sku']})")

# Open PDF
doc = fitz.open(PDF_PATH)
print(f"\nPDF has {doc.page_count} pages")

# Build a searchable structure: page -> text content + images
matched = 0
not_found = []

for item in missing:
    sku = item['sku']
    nombre = item['nombre'].lower()
    
    # Search through all pages for text containing this sku or product name
    # (Look for first 3-4 words of the nombre for fuzzy matching)
    words = nombre.split()[:4]
    search_terms = [sku.lower()] + [' '.join(words[:3]), ' '.join(words[:2])]
    
    found_page = None
    for page_num in range(doc.page_count):
        page = doc[page_num]
        text = page.get_text().lower()
        if any(term in text for term in search_terms if len(term) > 4):
            found_page = page_num
            break
    
    if found_page is None:
        not_found.append(item)
        continue

    # Get all images on this page
    page = doc[found_page]
    image_list = page.get_images(full=True)
    
    if not image_list:
        # Try adjacent pages
        for adj in [found_page + 1, found_page - 1]:
            if 0 <= adj < doc.page_count:
                image_list = doc[adj].get_images(full=True)
                if image_list:
                    page = doc[adj]
                    break
    
    if not image_list:
        print(f"  ✗ Page found (p.{found_page+1}) but no images for: {sku}")
        not_found.append(item)
        continue

    # Get the largest image on this page (most likely the product photo)
    best_img = None
    best_size = 0
    for img in image_list:
        xref = img[0]
        try:
            base_image = doc.extract_image(xref)
            size = len(base_image['image'])
            if size > best_size:
                best_size = size
                best_img = base_image
        except:
            pass

    if best_img and best_size > 10000:  # At least 10KB
        dest = f"./images/{sku}.jpg"
        img_bytes = best_img['image']
        # Convert to jpg if not already
        if best_img['ext'] != 'jpg' and best_img['ext'] != 'jpeg':
            from PIL import Image
            import io
            pil_img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
            buf = io.BytesIO()
            pil_img.save(buf, format='JPEG', quality=90)
            img_bytes = buf.getvalue()
        
        with open(dest, 'wb') as f:
            f.write(img_bytes)
        print(f"  ✓ SAVED p.{found_page+1}: {sku}.jpg ({best_size//1024}KB)")
        matched += 1
    else:
        print(f"  ✗ Images too small on p.{found_page+1} for: {sku}")
        not_found.append(item)

print(f"\n=== DONE ===")
print(f"Matched & saved: {matched}")
print(f"Still not found: {len(not_found)}")
if not_found:
    print("Still missing SKUs:")
    for n in not_found:
        print(f"  - {n['sku']} ({n['nombre']})")
