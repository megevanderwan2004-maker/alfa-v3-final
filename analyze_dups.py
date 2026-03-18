"""
Correction des SKUs dupliqués dans catalog.js.

Confirmé depuis cat-alfa.pdf (p.98-99) :
- #PCBCY2X16TR → CABLE REMOTO CALIBRE 18 = erreur, le bon est #PCBCY2X14TR? Non.
  PDF p.98 layout:
    CABLE REMOTO CALIBRE 18 NEGRO  = #PCBCY12X22BI
    CABLE PARA INSTALACIONES CALIBRE 0 = #PCBCY2X14TR (prix $383 dans PDF)
    CABLE REMOTO CALIBRE 18         = #PCBCY2X16TR (prix $5)
    CABLE PARA INSTALACIÓN CALIBRE 4 = #PCBCY1X4RO
    CABLE REMOTO CALIBRE 18 AZUL    = #PCBCY2X18BI (prix $5)
    CABLE PARA INSTALACIÓN CALIBRE 8 = #PCBCY1X8RO

  PDF p.99:
    CABLE BICOLOR 2X22               = #PCBCY2X22BI
    KIT DE INSTALACION CABLE ALFA 4GA = #KCBINALCCA4
    CABLE PARA INSTALACIÓN CALIBRE 14 2 PUNTAS = #PCBCY2X14TR
    CABLE PARA INSTALACIÓN CALIBRE 16 2 PUNTAS = #PCBCY2X16TR
    CABLE BICOLOR 2X18               = #PCBCY2X18BI

=> Le problème : les SKUs PCBCY2X14TR, PCBCY2X16TR, PCBCY2X18BI apparaissent sur 2 pages avec 2 noms différents.
=> Le PDF réutilise en effet les mêmes SKUs pour 2 produits (ex: CABLE REMOTO 18 et CABLE INSTL 14 ont le même SKU).
=> C'est une erreur du fabricant/catalogue. catalog.js doit avoir un seul produit par SKU.

DÉCISION : Garder les vrais noms de produits (Calibre 14, 16, etc.) et marquer les CABLE REMOTO
avec des SKUs alternatifs plus logiques:
- CABLE REMOTO CALIBRE 18       → #PCBCY2X16TR  (laisser en l'état, c'est le SKU page 98 aussi)
- CABLE REMOTO CALIBRE 18 AZUL  → #PCBCY2X18BI  (laisser en l'état)
- CABLE PARA INSTALACIONES CALIBRE 0 → #PCBCY2X14TR (laisser — même SKU dans le PDF p.98)

POUR PUNLEALRC004:
- FARO CUADRADO 7" 2X3   → #PUNLEALRC004 (p.55 du PDF — faro)
- UNIDAD CUADRADA 7" 5X4 CON BARRA CENTRAL → #PUNLEALRC005 (déjà dans catalog.js séparément)
  Vérifier si UNIDAD CUADRADA 7" 2X3 a un SKU différent dans le PDF...
"""

import re

# Actually the simplest safe fix: remove the FIRST occurrence of
# each duplicate (which is the less-specific/less-accurate product name
# from earlier in the file), since the SECOND occurrence correctly
# matches the cable instalación products on PDF p.99.

# For PUNLEALRC004: the PDF page 55 has FARO CUADRADO 7" 2X3 (#PUNLEALRC004)
# and page 61 has UNIDAD CUADRADA 7" 5X4 CON BARRA CENTRAL (#PUNLEALRC004) — both real SKUs.
# catalog.js already has #PUNLEALRC005 for "UNIDAD CUADRADA 7" 5X4 CON BARRA CENTRAL"
# so the second PUNLEALRC004 duplicate is actually a DIFFERENT product sharing a SKU.
# Safest: leave PUNLEALRC004 as-is (both products have this SKU in the official catalog PDF).

PROJECT = '/Users/erwanmegevand/Downloads/ALFA-V3-PROPRE'
f = open(f'{PROJECT}/catalog.js', encoding='utf-8').read()

# Find the 3 cable duplicate positions
cable_fixes = {
    'PCBCY2X14TR': ('CABLE PARA INSTALACIONES CALIBRE 0', 'CABLE PARA INSTALACIÓN CALIBRE 14 2 PUNTAS'),
    'PCBCY2X16TR': ('CABLE REMOTO CALIBRE 18', 'CABLE PARA INSTALACIÓN CALIBRE 16 2 PUNTAS'),
    'PCBCY2X18BI': ('CABLE REMOTO CALIBRE 18 AZUL', 'CABLE BICOLOR 2X18'),
}

print("Analyse des doublons câbles :")
for sku, (first_name, second_name) in cable_fixes.items():
    # Both exist in the PDF with the same SKU — the PDF itself has this collision.
    # In the website catalog, we need a unique SKU per product.
    # The CABLE REMOTO products already have a distinct primary SKU on page 98.
    # Check what SKU the PDF gives to CABLE REMOTO CALIBRE 18:
    print(f"\n  #{sku}:")
    print(f"    Occurrence 1: {first_name} (page 98 du PDF — c'est le SKU officiel de ce produit)")
    print(f"    Occurrence 2: {second_name} (page 99 du PDF — également #{sku})")
    print(f"    => Les 2 produits ont le MÊME SKU dans le catalogue officiel.")
    print(f"    => La duplication existe dans le PDF. catalog.js reflète fidèlement le PDF.")

print("""
CONCLUSION :
  - Les SKUs #PCBCY2X14TR / #PCBCY2X16TR / #PCBCY2X18BI sont partagés entre 2 produits différents 
    dans le catalogue officiel PDF — c'est une erreur du catalogue lui-même.
  - catalog.js reflète fidèlement cette réalité (2 produits, même SKU).
  - #PUNLEALRC004 idem : 2 produits différents ont ce SKU dans le PDF.
  
  Pour ne rien casser, aucune modification n'est appliquée — les doublons existent
  dans la source officielle (le PDF), pas seulement dans catalog.js.
  
  Recommandation : si vous souhaitez les distinguer, il faudra créer des SKUs 
  alternatifs manuellement (ex: PCBCY2X14TR-B pour le second produit).
""")
