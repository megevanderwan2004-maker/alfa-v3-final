# RÈGLES DU PROJET

RÈGLE ABSOLUE — NE JAMAIS TOUCHER :
- La logique de chargement des images dans `script.js` (doit toujours lire `image_url` depuis Supabase)
- Les appels à `supabase.from('catalog')`
- Les clés dans `.env`

AVANT CHAQUE GIT PUSH :
Vérifier que `script.js` utilise encore `image_url` depuis Supabase et non `./images/`
