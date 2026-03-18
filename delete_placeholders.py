import hashlib, os

IMAGES_DIR = '/Users/erwanmegevand/Downloads/ALFA-V3-PROPRE/images'

def md5(path):
    h = hashlib.md5()
    with open(path, 'rb') as f:
        h.update(f.read())
    return h.hexdigest()

# Reference file — known "imagen no disponible" placeholder
ref_file = os.path.join(IMAGES_DIR, 'PFOXEAL35D2R.jpg')
if not os.path.exists(ref_file):
    # Try any other known placeholder
    print(f"ERROR: {ref_file} not found")
    exit(1)

ref_hash = md5(ref_file)
print(f"Hash de référence ({os.path.basename(ref_file)}) : {ref_hash}")
print(f"Taille : {os.path.getsize(ref_file)} bytes\n")

# Scan all JPGs
deleted = []
kept = 0

for fname in sorted(os.listdir(IMAGES_DIR)):
    if not fname.lower().endswith('.jpg'):
        continue
    fpath = os.path.join(IMAGES_DIR, fname)
    h = md5(fpath)
    if h == ref_hash:
        print(f"  SUPPRIMER : {fname}")
        os.remove(fpath)
        deleted.append(fname)
    else:
        kept += 1

print(f"\n=== RÉSULTAT ===")
print(f"  Fichiers supprimés : {len(deleted)}")
print(f"  Fichiers conservés : {kept}")
if deleted:
    print(f"\nListe des fichiers supprimés :")
    for f in deleted:
        print(f"  - {f}")
