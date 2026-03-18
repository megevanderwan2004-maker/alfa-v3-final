import fitz, re, json, os

PROJECT = '/Users/erwanmegevand/Downloads/ALFA-V3-PROPRE'
PDF_PATH = os.path.join(PROJECT, '(COMPLETO) 2025 MOSTRADOR Catalogo alfa performance.pdf (2)_compressed.pdf')
CATALOG_PATH = os.path.join(PROJECT, 'catalog.js')

# 1. Load current catalog
catalog_js = open(CATALOG_PATH, encoding='utf-8').read()
# Extracting objects with regex for matching
# pattern: { nombre: "...", sku: "#...", precio: ..., ... }
product_blocks = re.findall(r'\{[^{}]+\}', catalog_js, re.DOTALL)
current_products = []
for block in product_blocks:
    name_m = re.search(r'nombre:\s*"([^"]+)"', block)
    sku_m = re.search(r'sku:\s*"#([^"]+)"', block)
    price_m = re.search(r'precio:\s*([0-9.]+)', block)
    if name_m and sku_m and price_m:
        current_products.append({
            'name': name_m.group(1),
            'sku': sku_m.group(1),
            'price': float(price_m.group(1))
        })

print(f"Loaded {len(current_products)} products from catalog.js")

# 2. Extract from PDF
doc = fitz.open(PDF_PATH)
pdf_data = {} # sku -> price

for pn in range(doc.page_count):
    text = doc[pn].get_text('text')
    skus = re.findall(r'#([A-Z0-9.\-]+)', text)
    prices = re.findall(r'\$([0-9,.]+)', text)
    
    if skus and prices:
        # If multiple SKUs group together, they often share a price block
        # Or they follow 1:1. 
        # On Page 5, 5 SKUs and 6 prices. The 6th price belongs to "880" which is missing its SKU #
        # We will try to match based on order, but it's safer to use the SKU as key.
        
        # Heuristic: if same number, pair them.
        if len(skus) == len(prices):
            for s, p in zip(skus, prices):
                val = float(re.sub(r'[^0-9.]', '', p))
                pdf_data[s] = val
        elif len(skus) < len(prices):
            # Try to match SKUs to the LAST N prices? 
            # Or identify the name above. 
            # For now, let's just pair what we can.
            for i in range(min(len(skus), len(prices))):
                val = float(re.sub(r'[^0-9.]', '', prices[i]))
                pdf_data[skus[i]] = val

# 3. Generate report
changes = []
matched_skus = 0
unmatched_in_pdf = set(pdf_data.keys())

for prod in current_products:
    if prod['sku'] in pdf_data:
        new_price = pdf_data[prod['sku']]
        if prod['price'] != new_price:
            changes.append({
                'name': prod['name'],
                'sku': prod['sku'],
                'old': prod['price'],
                'new': new_price
            })
        matched_skus += 1
        unmatched_in_pdf.discard(prod['sku'])

print(f"Matched {matched_skus} SKUs. Found {len(changes)} potential price changes.")

report = {
    'total_in_catalog': len(current_products),
    'matched_with_pdf': matched_skus,
    'changes': changes,
    'unmatched_pdf_skus': sorted(list(unmatched_in_pdf))
}

with open(os.path.join(PROJECT, 'price_update_draft.json'), 'w') as f:
    json.dump(report, f, indent=2)

print(f"Draft report saved to price_update_draft.json")
