import os
from PIL import Image

def fix_unreadable_images(directory, filenames):
    results = []
    for filename in filenames:
        filepath = os.path.join(directory, filename)
        if not os.path.exists(filepath):
            results.append(f"{filename}: File not found")
            continue
            
        try:
            # Open without verifying extension
            with Image.open(filepath) as img:
                # Convert to RGB (in case it's RGBA/WebP with alpha)
                rgb_img = img.convert('RGB')
                # Save back as JPEG
                rgb_img.save(filepath, 'JPEG')
                results.append(f"{filename}: Successfully converted and saved as JPEG")
        except Exception as e:
            results.append(f"{filename}: Error during conversion - {e}")
            
    return results

if __name__ == "__main__":
    image_dir = "./images"
    files_to_fix = [
        "PFOXEPH42402.jpg", "KUNLEALRD007.jpg", "KFALEALAU005.jpg",
        "KUNLEALRD004.jpg", "PFOXEPH92854.jpg", "KFALEALAU001.jpg"
    ]
    
    fixing_results = fix_unreadable_images(image_dir, files_to_fix)
    for res in fixing_results:
        print(res)
