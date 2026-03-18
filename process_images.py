import os
from PIL import Image

def get_image_info(directory, target_files, unreadable_files):
    info_list = []
    
    # Process target files
    for filename in target_files:
        filepath = os.path.join(directory, filename)
        size_kb = os.path.getsize(filepath) / 1024
        try:
            with Image.open(filepath) as img:
                width, height = img.size
                info_list.append({
                    'filename': filename,
                    'dimensions': f"{width}x{height}",
                    'size_kb': round(size_kb, 2),
                    'type': 'Candidate'
                })
        except Exception as e:
            # Should not happen for candidates, but just in case
            info_list.append({
                'filename': filename,
                'dimensions': 'Unknown',
                'size_kb': round(size_kb, 2),
                'type': 'Candidate (Error)'
            })

    # Process unreadable files
    for filename in unreadable_files:
        filepath = os.path.join(directory, filename)
        if os.path.exists(filepath):
            size_kb = os.path.getsize(filepath) / 1024
            info_list.append({
                'filename': filename,
                'dimensions': 'N/A',
                'size_kb': round(size_kb, 2),
                'type': 'Unreadable'
            })
        else:
            print(f"File {filename} not found.")

    return info_list

if __name__ == "__main__":
    image_dir = "./images"
    
    # Files identified previously
    candidates = [
        "PBAALSL240R.jpg", "PTEALSVL2.jpg", "KBAALMIB018R.jpg", "PFOXEOS86176.jpg",
        "PTEALTFDFD1.jpg", "PBASY34026.jpg", "PTEALFDV2-110.jpg", "PFALEALRD005.jpg",
        "PTEALFDV2-312.jpg", "KANALNA102.jpg", "PAMAL600.5D.jpg", "KBAALMIB054R.jpg",
        "PBAALMIBL036R.jpg", "PBAALSL180R.jpg", "PBASY34044.jpg", "PTEALFDV2-205.jpg",
        "KBAALMIB072R.jpg", "PBAALSL300C.jpg", "PBAALSL120R.jpg", "PBASY34060.jpg",
        "PBAALMIB072R.jpg", "PBASY34058.jpg", "PBLACAL55.jpg", "PBASY34028.jpg",
        "PFOXENE85254.jpg", "KBAALMIB036R.jpg", "PTEALBNYF2.jpg", "PTEALFDFV2.jpg",
        "PTEALFDFN2.jpg", "PFALEALRC007.jpg", "PTEALFDV2-250.jpg", "PBAALMIB018R.jpg"
    ]
    
    unreadable = [
        "PFOXEPH42402.jpg", "KUNLEALRD007.jpg", "KFALEALAU005.jpg",
        "KUNLEALRD004.jpg", "PFOXEPH92854.jpg", "KFALEALAU001.jpg"
    ]
    
    results = get_image_info(image_dir, list(set(candidates)), unreadable)
    
    print(f"{'Filename':<30} | {'Dimensions':<15} | {'Size (KB)':<10} | {'Type':<15}")
    print("-" * 75)
    for r in results:
        print(f"{r['filename']:<30} | {r['dimensions']:<15} | {r['size_kb']:<10} | {r['type']:<15}")
