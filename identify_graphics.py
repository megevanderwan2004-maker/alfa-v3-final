import os
from PIL import Image

def identify_graphics(directory, threshold=240, min_percentage=85.0):
    graphics_to_delete = []
    
    if not os.path.exists(directory):
        print(f"Error: Directory {directory} does not exist.")
        return []

    files = [f for f in os.listdir(directory) if f.lower().endswith('.jpg')]
    total_files = len(files)
    
    print(f"Scanning {total_files} JPG files in {directory}...")

    for filename in files:
        filepath = os.path.join(directory, filename)
        try:
            with Image.open(filepath) as img:
                # Convert to grayscale
                gray_img = img.convert('L')
                pixels = list(gray_img.getdata())
                
                # Count pixels > threshold
                white_pixels = sum(1 for p in pixels if p > threshold)
                percentage = (white_pixels / len(pixels)) * 100
                
                if percentage > min_percentage:
                    sku = os.path.splitext(filename)[0]
                    graphics_to_delete.append({
                        'filename': filename,
                        'sku': sku,
                        'percentage': percentage
                    })
        except Exception as e:
            print(f"Error processing {filename}: {e}")

    return graphics_to_delete

if __name__ == "__main__":
    image_dir = "./images"
    results = identify_graphics(image_dir)
    
    print("\nCandidates for deletion (Spec Graphics):")
    for item in results:
        print(f"- {item['filename']} (SKU: {item['sku']}, White pixels: {item['percentage']:.2f}%)")
    
    print(f"\nTotal identified: {len(results)}")
    
    # Save results to a temporary file for the agent to read
    with open("candidates_to_delete.txt", "w") as f:
        for item in results:
            f.write(f"{item['filename']}|{item['sku']}\n")
