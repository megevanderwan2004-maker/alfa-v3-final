import os, re

PROJECT = '/Users/erwanmegevand/Downloads/ALFA-V3-PROPRE'
catalog_js = open(os.path.join(PROJECT, 'catalog.js'), encoding='utf-8').read()

# Extract all SKUs (strip leading #)
skus_raw = re.findall(r'sku:\s*"#([A-Z0-9.\-]+)"', catalog_js)

# Deduplicate preserving order
seen = set()
unique_skus = []
for s in skus_raw:
    if s not in seen:
        seen.add(s)
        unique_skus.append(s)

print(f'Total unique SKUs in catalog: {len(unique_skus)}')

images_dir = os.path.join(PROJECT, 'images')
avec_image = [s for s in unique_skus if os.path.exists(os.path.join(images_dir, s + '.jpg'))]
sans_image = [s for s in unique_skus if not os.path.exists(os.path.join(images_dir, s + '.jpg'))]

print(f'\n=== ÉTAPE 1 — RÉSULTAT ===')
print(f'  Produits AVEC image  : {len(avec_image)}')
print(f'  Produits SANS image  : {len(sans_image)}')
if sans_image:
    print()
    print('=== SANS IMAGE ===')
    for s in sans_image:
        print(f'  - {s}')

# Save for next steps
with open(os.path.join(PROJECT, 'sans_image.txt'), 'w') as f:
    f.write('\n'.join(sans_image))
print(f'\nListe sauvegardée dans sans_image.txt')
