import fitz  # PyMuPDF
import os
import io
from PIL import Image

def extract_missing_from_pdf(pdf_path, missing_skus, output_dir, min_dim=200):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    doc = fitz.open(pdf_path)
    found_skus = {}
    
    print(f"Scanning PDF for {len(missing_skus)} SKUs...")
    
    for page_num in range(doc.page_count):
        page = doc[page_num]
        text = page.get_text()
        
        # Check which missing SKUs are on this page
        skus_on_page = []
        for sku in missing_skus:
            if sku in text:
                skus_on_page.append(sku)
        
        if not skus_on_page:
            continue
            
        # Get images from the page
        image_list = page.get_images(full=True)
        valid_images = []
        
        for img_info in image_list:
            xref = img_info[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            
            try:
                img = Image.open(io.BytesIO(image_bytes))
                width, height = img.size
                if width >= min_dim and height >= min_dim:
                    valid_images.append({
                        'bytes': image_bytes,
                        'size': width * height,
                        'ext': base_image['ext'],
                        'width': width,
                        'height': height
                    })
            except Exception as e:
                continue
        
        if not valid_images:
            continue
            
        # Sort valid images by size (largest first)
        valid_images.sort(key=lambda x: x['size'], reverse=True)
        best_image = valid_images[0]
        
        # Assign this image to all missing SKUs found on this page
        for sku in skus_on_page:
            if sku not in found_skus:
                dest_path = os.path.join(output_dir, f"{sku}.jpg")
                
                # Convert to RGB/JPEG if necessary
                try:
                    img = Image.open(io.BytesIO(best_image['bytes'])).convert('RGB')
                    img.save(dest_path, 'JPEG', quality=95)
                    found_skus[sku] = {
                        'page': page_num + 1,
                        'dims': f"{best_image['width']}x{best_image['height']}"
                    }
                    print(f"  ✓ Found p.{page_num+1}: {sku} ({best_image['width']}x{best_image['height']})")
                except Exception as e:
                    print(f"  ✗ Error saving {sku}: {e}")
                    
    return found_skus

if __name__ == "__main__":
    PDF_FILE = "cat-alfa.pdf"
    MISSING_SKUS = [
        "KANALNA102", "PBAALMIBL036R", "PBAALSL120R", "PBAALSL180R", "PBAALSL240R",
        "PBAALSL300C", "PBASY34026", "PBASY34028", "PBASY34044", "PBASY34058",
        "PBASY34060", "PFOXEOS86176", "PTEALBNYF2", "PTEALFDFN2", "PTEALFDFV2",
        "PTEALFDV2-110", "PTEALFDV2-205", "PTEALFDV2-250", "PTEALFDV2-312",
        "PFOXEPH42402", "KUNLEALRD007", "KFALEALAU005", "KUNLEALRD004",
        "PFOXEPH92854", "KFALEALAU001"
    ]
    IMAGE_DIR = "./images"
    
    results = extract_missing_from_pdf(PDF_FILE, MISSING_SKUS, IMAGE_DIR)
    
    print(f"\nSummary: Found {len(results)} out of {len(MISSING_SKUS)} SKUs in PDF.")
    remaining = [s for s in MISSING_SKUS if s not in results]
    if remaining:
        print("Remaining SKUs to search on website:")
        for r in remaining:
            print(f"  - {r}")
        with open("remaining_skus.txt", "w") as f:
            for r in remaining:
                f.write(f"{r}\n")
