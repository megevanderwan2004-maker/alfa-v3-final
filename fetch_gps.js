const { execSync } = require('child_process');
const cheerio = require('cheerio');

try {
    const html = execSync(`curl -sA "Mozilla/5.0" "https://mcielectronics.cl/shop/product/rastreador-gps-coban-gps403a-4g-2g-33303"`).toString();
    const $ = cheerio.load(html);
    const imgUrl = $('.product-image-container img').attr('src') || $('img.wp-post-image').attr('src') || $('img').filter((i, el) => $(el).attr('src') && $(el).attr('src').includes('gps')).first().attr('src');
    if (imgUrl) {
        console.log("Found GPS image:", imgUrl);
        execSync(`curl -sA "Mozilla/5.0" -o "./images/KGPCO403A.jpg" "${imgUrl}"`);
        console.log("Downloaded GPS KGPCO403A.jpg");
    } else {
        console.log("No image found for GPS");
    }
} catch(e) { console.error(e.message); }
