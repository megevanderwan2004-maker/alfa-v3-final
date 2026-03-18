const { execSync } = require('child_process');
const cheerio = require('cheerio');

function fetchML(query, sku) {
    try {
        console.log(`Searching MercadoLibre for ${query}...`);
        const url = `https://listado.mercadolibre.com.mx/${query.replace(/ /g, '-')}`;
        const html = execSync(`curl -sLA "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36" "${url}"`).toString();
        const $ = cheerio.load(html);
        
        let imgUrl = $('img.ui-search-result-image__image').first().attr('src') || $('img.ui-search-result-image__image').first().attr('data-src');
        if (!imgUrl) {
            // ML sometimes uses different classes for search result images
            imgUrl = $('.ui-search-result-image img').first().attr('src') || $('.ui-search-result-image img').first().attr('data-src');
        }

        if (imgUrl) {
            // Get the highest resolution version possible by changing the suffix from e.g. -I.jpg to -O.jpg or keeping the largest
            console.log(`Found image: ${imgUrl}`);
            execSync(`curl -sLA "Mozilla/5.0" -o "./images/${sku}.jpg" "${imgUrl}"`);
            console.log(`Saved as ./images/${sku}.jpg`);
        } else {
            console.log(`Could not find image for ${query}`);
        }
    } catch(e) {
        console.error(e.message);
    }
}

fetchML("actuador seguros electricos 2 cables", "PACAL");
fetchML("gps coban 403a", "KGPCO403A");
