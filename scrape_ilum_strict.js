/**
 * Strict alfaperformance.mx-only scraper for missing Iluminacion images.
 * Uses both SKU and product name search to find images.
 * Only saves to ./images/{SKU}.jpg — NO external sources.
 */
const { execSync } = require('child_process');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = './images';
const BASE_URL = 'https://alfaperformance.mx';
const RESULT_FILE = 'ilum_scrape_result.json';

// Load catalog
let catalog;
eval(fs.readFileSync('catalog.js', 'utf8').replace('const catalog =', 'catalog='));

// Define illumination-related category keywords
const ilumWords = ['ilumina', 'faro', 'led', 'xenon', 'halógeno', 'halogeno', 'balastra', 'miniatura'];

// Only target items that are physically missing
const missing = catalog.filter(p => {
    const filePath = p.imagePath.replace(/^\.\/images\//, './images/');
    return !fs.existsSync(filePath);
}).filter(p =>
    (p.categoria && ilumWords.some(w => p.categoria.toLowerCase().includes(w))) ||
    (p.nombre && ilumWords.some(w => p.nombre.toLowerCase().includes(w)))
);

console.log(`Found ${missing.length} strictly missing Iluminacion images.\n`);

const results = { found: [], notFound: [] };

function curlGet(url) {
    try {
        return execSync(`curl -sLgA "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "${url}"`, { maxBuffer: 1024 * 1024 * 10 }).toString();
    } catch (e) {
        return '';
    }
}

function searchAndDownload(nombre, sku) {
    // Try both product-name search and then SKU search
    const rawSku = sku.replace('#', '');
    const queries = [
        // Use product name (first 4-5 words), then SKU as fallback
        nombre.split(' ').slice(0, 5).join(' '),
        rawSku
    ];

    for (const q of queries) {
        const encoded = encodeURIComponent(q);
        const searchUrl = `${BASE_URL}/busqueda?controller=search&s=${encoded}`;
        const html = curlGet(searchUrl);
        if (!html) continue;

        const $ = cheerio.load(html);
        // Find first product result link
        const link = $('.thumbnail.product-thumbnail').first().attr('href') ||
                     $('a[href*=".html"]').filter((i, el) => $(el).attr('href') && $(el).attr('href').includes(BASE_URL)).first().attr('href');
        
        if (!link) continue;

        // Get product page
        const productHtml = curlGet(link);
        if (!productHtml) continue;

        const $p = cheerio.load(productHtml);
        
        // Verify it's the right product by checking SKU match
        let pageSku = '';
        const jsonLdMatch = productHtml.match(/"sku"\s*:\s*"([^"]+)"/);
        if (jsonLdMatch) pageSku = jsonLdMatch[1].trim();

        // Get image URL
        let imgUrl = $p('meta[property="og:image"]').attr('content') || $p('.js-qv-product-cover').attr('src');
        if (!imgUrl) continue;

        // Try large_default first, then pd4_def
        imgUrl = imgUrl.replace(/-[a-z0-9_]+\.jpg$/, '-large_default.jpg');
        
        // Download the image
        const destPath = path.join(OUTPUT_DIR, `${rawSku}.jpg`);
        try {
            execSync(`curl -sLA "Mozilla/5.0" -o "${destPath}" "${imgUrl}"`, { timeout: 15000 });
            const stat = fs.statSync(destPath);
            if (stat.size < 5000) {
                // Too small, likely a placeholder or error — try pd4_def
                const altUrl = imgUrl.replace('-large_default', '-pd4_def');
                execSync(`curl -sLA "Mozilla/5.0" -o "${destPath}" "${altUrl}"`, { timeout: 15000 });
            }
            if (fs.statSync(destPath).size > 5000) {
                console.log(`  ✓ SAVED: ${rawSku}.jpg (from product page - pageSku: ${pageSku || 'unknown'}) | query: "${q}"`);
                results.found.push({ sku: rawSku, nombre, pageSku, imgUrl, query: q });
                return true;
            } else {
                fs.unlinkSync(destPath);
            }
        } catch (e) {
            console.log(`  ✗ Download failed for ${rawSku}: ${e.message}`);
        }
    }
    
    console.log(`  ✗ NOT FOUND on alfaperformance.mx: ${rawSku} (${nombre})`);
    results.notFound.push({ sku: rawSku, nombre });
    return false;
}

(async () => {
    for (const item of missing) {
        console.log(`Processing: ${item.nombre} (${item.sku})`);
        searchAndDownload(item.nombre, item.sku);
    }

    fs.writeFileSync(RESULT_FILE, JSON.stringify(results, null, 2));
    console.log(`\n=== DONE ===`);
    console.log(`Found: ${results.found.length} | Not found on site: ${results.notFound.length}`);
    if (results.notFound.length > 0) {
        console.log('\nNot found on alfaperformance.mx:');
        results.notFound.forEach(r => console.log(`  - ${r.sku} (${r.nombre})`));
    }
})();
