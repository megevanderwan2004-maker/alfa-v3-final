"""
Audit complet catalog.js vs cat-alfa.pdf :
- Extrait tous les SKUs de catalog.js
- Extrait tous les SKUs du PDF (pattern #XXXX)
- Compare les deux listes
- Signale les extras et les manquants dans chaque sens
"""
import fitz, re, json

PROJECT = '/Users/erwanmegevand/Downloads/ALFA-V3-PROPRE'

# ── 1. SKUs dans catalog.js ──────────────────────────────────────────────────
catalog_js = open(f'{PROJECT}/catalog.js', encoding='utf-8').read()

# Extract full product objects for richer info
# Grab sku fields
skus_catalog_raw = re.findall(r'sku:\s*"(#[A-Z0-9.\-]+)"', catalog_js)
# Deduplicate preserving order
seen = set(); catalog_skus = []
for s in skus_catalog_raw:
    if s not in seen:
        seen.add(s)
        catalog_skus.append(s)

catalog_set = set(catalog_skus)
print(f"catalog.js — {len(catalog_skus)} SKUs uniques")

# ── 2. SKUs dans cat-alfa.pdf ────────────────────────────────────────────────
doc = fitz.open(f'{PROJECT}/cat-alfa.pdf')
print(f"cat-alfa.pdf — {doc.page_count} pages")

# Regex: # suivi de lettres majuscules et chiffres (au moins 5 chars total)
SKU_RE = re.compile(r'#([A-Z][A-Z0-9.\-]{4,})')

pdf_skus_raw = []
pdf_page_map = {}  # sku -> [pages]
for page_num in range(doc.page_count):
    text = doc[page_num].get_text()
    for m in SKU_RE.finditer(text):
        raw = '#' + m.group(1)
        if raw not in pdf_page_map:
            pdf_page_map[raw] = []
            pdf_skus_raw.append(raw)
        pdf_page_map[raw].append(page_num + 1)

pdf_set = set(pdf_skus_raw)
print(f"cat-alfa.pdf — {len(pdf_skus_raw)} SKUs uniques trouvés dans le texte")

# ── 3. Comparaison ───────────────────────────────────────────────────────────
in_catalog_not_pdf = sorted(catalog_set - pdf_set)
in_pdf_not_catalog = sorted(pdf_set - catalog_set)
in_both            = sorted(catalog_set & pdf_set)

print(f"\n=== RÉSULTAT COMPARAISON ===")
print(f"  Présents dans les DEUX               : {len(in_both)}")
print(f"  Dans catalog.js MAIS PAS dans le PDF : {len(in_catalog_not_pdf)}")
print(f"  Dans le PDF MAIS PAS dans catalog.js : {len(in_pdf_not_catalog)}")

if in_catalog_not_pdf:
    print(f"\n⚠️  SKUs dans catalog.js mais ABSENTS du PDF (peut-être supprimés du catalogue ?) :")
    for s in in_catalog_not_pdf:
        print(f"   {s}")

if in_pdf_not_catalog:
    print(f"\n⚠️  SKUs dans le PDF mais ABSENTS de catalog.js (manquants sur le site ?) :")
    for s in in_pdf_not_catalog:
        pages = pdf_page_map.get(s, [])
        print(f"   {s}  (p.{pages})")

# ── 4. Vérification des doublons dans catalog.js ────────────────────────────
all_catalog = [s for s in skus_catalog_raw]
dups = {s for s in all_catalog if all_catalog.count(s) > 1}
if dups:
    print(f"\n⚠️  Doublons dans catalog.js ({len(dups)}) :")
    for d in sorted(dups):
        print(f"   {d}  ({all_catalog.count(d)}x)")
else:
    print(f"\n✅ Aucun doublon de SKU dans catalog.js")

# ── 5. Sauvegarde rapport ────────────────────────────────────────────────────
report = {
    'catalog_count': len(catalog_skus),
    'pdf_count': len(pdf_skus_raw),
    'in_both': len(in_both),
    'in_catalog_not_pdf': in_catalog_not_pdf,
    'in_pdf_not_catalog': in_pdf_not_catalog,
    'duplicates_catalog': sorted(dups)
}
with open(f'{PROJECT}/audit_catalog_pdf.json', 'w') as f:
    json.dump(report, f, indent=2, ensure_ascii=False)
print(f"\nRapport JSON sauvegardé : audit_catalog_pdf.json")
