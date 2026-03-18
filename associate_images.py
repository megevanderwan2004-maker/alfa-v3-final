import shutil
import os

def associate_images():
    raw_dir = "./pdf_images_raw"
    target_dir = "./images"
    missing_file = "./images_manquantes_final.txt"
    
    mapping = {
        "PFOXEOS86176.jpg": "page42_img7.jpg",
        "PFOXEPH42402.jpg": "page43_img7.jpg",
        "PFOXEPH92854.jpg": "page43_img10.jpg",
        "PBAALMIBL036R.jpg": "page45_img8.jpg",
        "PBAALSL120R.jpg": "page46_img9.jpg",
        "PBAALSL180R.jpg": "page46_img9.jpg",
        "PBAALSL240R.jpg": "page47_img8.jpg",
        "PBAALSL300C.jpg": "page47_img8.jpg",
        "PBASY34026.jpg": "page48_img12.jpg",
        "PBASY34028.jpg": "page48_img12.jpg",
        "PBASY34044.jpg": "page49_img9.jpg",
        "PBASY34058.jpg": "page49_img9.jpg",
        "PBASY34060.jpg": "page49_img9.jpg",
        "KANALNA102.jpg": "page49_img9.jpg",
        "KUNLEALRD007.jpg": "page52_img10.jpg",
        "KUNLEALRD004.jpg": "page52_img11.jpg",
        "KFALEALAU005.jpg": "page53_img9.jpg",
        "KFALEALAU001.jpg": "page53_img16.jpg"
    }
    
    missing_terminales = [
        "PTEALBNYF2", "PTEALFDFN2", "PTEALFDFV2", "PTEALFDV2-110",
        "PTEALFDV2-205", "PTEALFDV2-250", "PTEALFDV2-312"
    ]
    
    # 1. Copy images
    for sku_file, raw_file in mapping.items():
        src = os.path.join(raw_dir, raw_file)
        dst = os.path.join(target_dir, sku_file)
        if os.path.exists(src):
            shutil.copy2(src, dst)
            print(f"Copied {raw_file} to {sku_file}")
        else:
            print(f"Warning: Source file {src} not found!")

    # 2. Log missing SKUs
    with open(missing_file, "w") as f:
        for sku in missing_terminales:
            f.write(f"{sku}\n")
    print(f"Logged {len(missing_terminales)} missing SKUs to {missing_file}")

if __name__ == "__main__":
    associate_images()
