import os
import re

def extract_skus_from_catalog(catalog_path):
    skus = set()
    try:
        with open(catalog_path, 'r', encoding='utf-8') as f:
            content = f.read()
            # Look for sku: "#SKU" or sku: "SKU"
            matches = re.findall(r'sku:\s*["\']#?([^"\']+)["\']', content)
            for m in matches:
                skus.add(m)
    except Exception as e:
        print(f"Error reading catalog: {e}")
    return skus

def identify_missing_images(image_dir, skus):
    # Get all filenames without extension
    existing_images = set()
    if os.path.exists(image_dir):
        for f in os.listdir(image_dir):
            if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                name = os.path.splitext(f)[0]
                existing_images.add(name)
    
    missing = []
    for sku in sorted(list(skus)):
        if sku not in existing_images:
            missing.append(sku)
            
    return missing

if __name__ == "__main__":
    catalog_file = "catalog.js"
    image_directory = "./images"
    
    all_skus = extract_skus_from_catalog(catalog_file)
    missing_skus = identify_missing_images(image_directory, all_skus)
    
    print(f"Total SKUs in catalog: {len(all_skus)}")
    print(f"SKUs missing images in {image_directory}: {len(missing_skus)}")
    print("\nMissing SKUs:")
    for sku in missing_skus:
        print(sku)
