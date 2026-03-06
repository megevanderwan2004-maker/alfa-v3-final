import fitz  # PyMuPDF
from PIL import Image
import io
import os
import re

PDF_PATH = "(FINAL)  2025 DISTRIBUIDOR Catalogo alfa performance.pdf_compressed.pdf"
OUT_DIR = "images"

if not os.path.exists(OUT_DIR):
    os.makedirs(OUT_DIR)

def extract_sku(text):
    match = re.search(r'(#[A-Z0-9]+)', text)
    if match:
        return match.group(1).replace('#', '').strip()
    
    # Try alternate SKU like ALF-123
    match = re.search(r'(ALF-[A-Z0-9-]+)', text)
    if match:
        return match.group(1).replace('#', '').strip()
    return ""

def process_pdf():
    print(f"Ouvrant {PDF_PATH}...")
    try:
        doc = fitz.open(PDF_PATH)
    except Exception as e:
        print(f"Erreur d'ouverture du PDF : {e}")
        return

    print(f"Total de pages à traiter : {len(doc)}")
    
    saved_count = 0

    for page_num in range(len(doc)):
        page = doc[page_num]
        print(f"Traitement de la page {page_num + 1}/{len(doc)}...", end='\r')
        
        # 2. Get all text blocks with coordinates
        blocks = page.get_text("blocks")
        text_blocks = [b for b in blocks if b[6] == 0] # block_type 0 is text

        # 3. Get images from the page
        image_list = page.get_image_info(xrefs=True)
        
        if not image_list:
            continue
            
        for img_info in image_list:
            try:
                img_bbox = img_info['bbox'] # (x0, y0, x1, y1)
                img_x0, img_y0, img_x1, img_y1 = img_bbox
                
                # Associated text
                associated_text = ""
                for tb in text_blocks:
                    tx0, ty0, tx1, ty1, t_text, t_id, t_type = tb
                    
                    is_below = ty0 >= img_y1 - 50 and ty0 <= img_y1 + 250 and (tx0 < img_x1 and tx1 > img_x0)
                    is_right = tx0 >= img_x1 - 50 and tx0 <= img_x1 + 350 and (ty0 < img_y1 and ty1 > img_y0)
                    is_overlap = (tx0 <= img_x1 and tx1 >= img_x0 and ty0 <= img_y1 and ty1 >= img_y0)
                    
                    if is_below or is_right or is_overlap:
                        associated_text += " " + t_text

                clean_text = " ".join(associated_text.split())
                
                sku = extract_sku(clean_text)

                if sku:
                    # Image processing
                    xref = img_info['xref']
                    if xref == 0: continue
                    pix = fitz.Pixmap(doc, xref)

                    # Optimize and save the image
                    if pix.colorspace and pix.colorspace.n == 4: # CMYK
                        pix = fitz.Pixmap(fitz.csRGB, pix)
                    img_data = pix.tobytes("png")
                    img = Image.open(io.BytesIO(img_data))
                    
                    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                        bg = Image.new('RGB', img.size, (255, 255, 255))
                        if img.mode == 'P': img = img.convert('RGBA')
                        bg.paste(img, mask=img.split()[3])
                        img = bg
                    elif img.mode != 'RGB':
                        img = img.convert('RGB')
                    
                    w, h = img.size
                    if w < 100 or h < 100:
                        continue

                    # Resize if too large
                    max_width = 600
                    if w > max_width:
                        new_h = int(max_width * h / w)
                        img = img.resize((max_width, new_h), Image.Resampling.LANCZOS)
                    
                    out_path = os.path.join(OUT_DIR, f"{sku}.jpg")
                    img.save(out_path, format="JPEG", quality=80, optimize=True)
                    saved_count += 1
                    
            except Exception as e:
                pass

    print(f"\nExtraction terminée ! {saved_count} images sauvegardées dans {OUT_DIR}/.")

if __name__ == "__main__":
    process_pdf()
