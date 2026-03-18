import fitz
import os

def extract_raw_images(pdf_path, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    doc = fitz.open(pdf_path)
    total_images = 0
    image_info = []

    print(f"Extracting raw images from {pdf_path}...")
    
    for page_index in range(len(doc)):
        page = doc[page_index]
        images = page.get_images(full=True)
        
        for img_index, img in enumerate(images):
            xref = img[0]
            try:
                # Using the Pixmap method suggested by the user
                pix = fitz.Pixmap(doc, xref)
                
                # If it's CMYK or similar, convert to RGB
                if pix.n - pix.alpha < 4:
                    pix_rgb = pix
                else:
                    pix_rgb = fitz.Pixmap(fitz.csRGB, pix)
                
                filename = f"page{page_index+1}_img{img_index+1}.jpg"
                filepath = os.path.join(output_dir, filename)
                
                pix_rgb.save(filepath)
                
                width = pix.width
                height = pix.height
                image_info.append(f"{filename}: {width}x{height}")
                total_images += 1
                
                # Cleanup pixmaps
                if pix != pix_rgb:
                    pix_rgb = None
                pix = None
            except Exception as e:
                print(f"Error extracting image {img_index} on page {page_index+1}: {e}")
                
    return total_images, image_info

if __name__ == "__main__":
    PDF_PATH = "cat-alfa.pdf"
    OUTPUT_DIR = "./pdf_images_raw"
    
    count, info = extract_raw_images(PDF_PATH, OUTPUT_DIR)
    
    print(f"\nTotal images found: {count}")
    print("\nDetailed list:")
    for line in info:
        print(line)
