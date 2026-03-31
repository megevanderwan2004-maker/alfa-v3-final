import pdfplumber
import re
import json

pdf_path = '/Users/erwanmegevand/Downloads/ALFA-V3-PROPRE/cat-alfa.pdf.pdf'
output_json = '/Users/erwanmegevand/Downloads/ALFA-V3-PROPRE/extracted_client_prices.json'

def extract_prices(path):
    all_data = {}
    with pdfplumber.open(path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if not text:
                continue
            
            # Pattern: matches SKU like #KFOLEALS2880 followed by optional space and Price like $250
            # Or Name followed by SKU followed by Price
            # We look for SKU (starts with #) and Price (starts with $)
            
            # Simple approach: find all occurrences of #SKU and $PRICE
            # often they follow each other in the text extraction
            
            # Find all #SKUs
            skus = re.findall(r'#([A-Z0-9.\-]+)', text)
            # Find all $Prices
            prices = re.findall(r'\$([0-9,.]+)', text)
            
            # If SKU is followed by a Price near it, we pair them.
            # However, looking at previous output, they often follow as SKU, Price.
            
            # Let's use a more granular search to keep order.
            # Example: #KFOLEALS2880 $250
            matches = re.finditer(r'(#[A-Z0-9.\-]+).*?\$([0-9,.]+)', text, re.DOTALL)
            count = 0
            for m in matches:
                sku = m.group(1).replace('#', '')
                price = float(m.group(2).replace(',', ''))
                # We store it, overwriting if multiple (should be same price)
                # Avoid storing large non-price numbers if any
                if price > 2: # heuristic to avoid small numbers if any
                    all_data[sku] = price
                    count += 1
            
            # Special case: some SKUs don't have # in some catalogs? No, # is consistent.
            
    return all_data

print("Starting extraction from cat-alfa.pdf.pdf...")
results = extract_prices(pdf_path)
print(f"Extracted {len(results)} retail price mappings.")

with open(output_json, 'w') as f:
    json.dump(results, f, indent=2)

print(f"Saved to {output_json}")
