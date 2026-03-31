import pdfplumber
import re
import json

# Load existing catalog to get SKU -> Name mapping
with open('/Users/erwanmegevand/Downloads/ALFA-V3-PROPRE/catalog.js', 'r', encoding='utf-8') as f:
    catalog_js = f.read()

# Pattern to find { nombre: "...", sku: "#..." }
# We'll use a simple regex to get a list of (name, sku)
matches = re.findall(r'\{[^{}]+\}', catalog_js, re.DOTALL)
sku_to_name = {}
name_to_sku = {}
for m in matches:
    name_m = re.search(r'"nombre":\s*"([^"]+)"', m)
    sku_m = re.search(r'"sku":\s*"#?([^"]+)"', m)
    if name_m and sku_m:
        name = name_m.group(1).upper().strip()
        sku = sku_m.group(1).strip()
        sku_to_name[sku] = name
        name_to_sku[name] = sku

print(f"Loaded {len(sku_to_name)} products from catalog.js")

# Now extract Name -> Price from cat-alfa.pdf.pdf
pdf_path = '/Users/erwanmegevand/Downloads/ALFA-V3-PROPRE/cat-alfa.pdf.pdf'
price_data = {} # SKU -> Price

with pdfplumber.open(pdf_path) as pdf:
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        if not text:
            continue
        
        # Method 1: SKU matched with Price (already tried, but let's improve)
        # Match #SKU then $Price OR $Price then #SKU
        sku_price_matches = re.findall(r'(#[A-Z0-9.\-]+)\s+\$([0-9,.]+)', text)
        for s, p in sku_price_matches:
            sku = s.replace('#', '')
            price = float(p.replace(',', ''))
            price_data[sku] = price

        price_sku_matches = re.findall(r'\$([0-9,.]+)\s+(#[A-Z0-9.\-]+)', text)
        for p, s in price_sku_matches:
            sku = s.replace('#', '')
            price = float(p.replace(',', ''))
            price_data[sku] = price

        # Method 2: Name matched with Price
        # This is harder because names can span multiple lines.
        # But we can look for strings from our catalog appearing in the text.
        for name, sku in name_to_sku.items():
            if sku in price_data: continue # already found
            
            # Escape parenthesis and special chars in name for regex
            escaped_name = re.escape(name).replace('\\ ', r'\s+')
            # Look for Name followed by $Price near it (within 100 chars)
            # Or $Price followed by Name
            pattern1 = rf'{escaped_name}.*?\$([0-9,.]+)'
            m1 = re.search(pattern1, text, re.DOTALL | re.IGNORECASE)
            if m1:
                price = float(m1.group(1).replace(',', ''))
                price_data[sku] = price
                continue
            
            pattern2 = rf'\$([0-9,.]+).*?{escaped_name}'
            m2 = re.search(pattern2, text, re.DOTALL | re.IGNORECASE)
            if m2:
                price = float(m2.group(1).replace(',', ''))
                price_data[sku] = price

print(f"Fixed extraction! Now have {len(price_data)} mappings.")

with open('/Users/erwanmegevand/Downloads/ALFA-V3-PROPRE/extracted_client_prices.json', 'w') as f:
    json.dump(price_data, f, indent=2)

