const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://egfurglzwuthkixwrvou.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZnVyZ2x6d3V0aGtpeHdydm91Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzk0Njg5MSwiZXhwIjoyMDg5NTIyODkxfQ.pwxE8EEQcQLYrjjP36RN6r8IT6DacXRQbE3WV4i9W9Q';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const article1_slug = 'guia-completa-mejor-sistema-audio-coche-guadalajara-2026';
const article2 = {
  slug: 'top-7-subwoofers-potentes-guadalajara-comparativa-precios-2026',
  title: 'Top 7 Subwoofers Mas Potentes en Guadalajara: Comparativa y Precios 2026',
  meta_description: 'Comparativa 2026 de los subwoofers mas potentes en Guadalajara.',
  category: 'Audio',
  featured_image: 'https://alfacaraudiomx.com/images/blog/subwoofers-guadalajara.jpg',
  preview_image: 'https://alfacaraudiomx.com/images/blog/subwoofers-guadalajara.jpg',
  excerpt: 'Descubre los 7 subwoofers mas potentes disponibles en Guadalajara en 2026.',
  keywords: ['subwoofer', 'guadalajara'],
  reading_time: 10,
  published: true,
  content: `# Top 7 Subwoofers Mas Potentes en Guadalajara: Comparativa y Precios 2026

Analizamos los subwoofers mas potentes disponibles en Guadalajara en 2026.

1. **Rockford Fosgate P3**: 600W RMS. Calidad extrema.
2. **JL Audio 12W0v3**: 300W RMS. Calidad SQ.
3. **ALFA Performance SUB-12**: 500W RMS. Mejor precio/potencia.
4. **Kicker 43C124**: Durabilidad diaria.
5. **Pioneer TS-W3060**: Ideal para SUVs.
6. **Skar Audio EVL-12**: 1250W RMS. Para SPL.
7. **MTX Audio 5512**: Opcion solida para iniciar.

**Conclusion**: El ALFA Performance es el ganador por precio en Guadalajara.
WhatsApp: 33 1568 6159`
};

async function run() {
  console.log('Nettoyage...');
  // Delete articles that are not Article 1 or Article 2
  const { data: current } = await supabase.from('blog_articles').select('slug');
  if (current) {
    for (const a of current) {
      if (a.slug !== article1_slug && a.slug !== article2.slug) {
        console.log(`Suppression de : ${a.slug}`);
        await supabase.from('blog_articles').delete().eq('slug', a.slug);
      }
    }
  }
  
  console.log('Publication Article 2...');
  const { error } = await supabase.from('blog_articles').upsert(article2, { onConflict: 'slug' });
  
  if (error) {
    console.error('Erreur insertion:', error);
    process.exit(1);
  }
  
  console.log('TERMINE : Uniquement Article 1 et Article 2 sont presents.');
  process.exit(0);
}

run();
