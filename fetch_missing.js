const { execSync } = require('child_process');
const cheerio = require('cheerio');
const fs = require('fs');

function fetchSearch(query) {
    try {
        console.log(`Searching for ${query}...`);
        const html = execSync(`curl -sA "Mozilla/5.0" "https://alfaperformance.mx/busqueda?controller=search&s=${query}"`).toString();
        const $ = cheerio.load(html);
        
        // Find product links
        const productLink = $('.thumbnail.product-thumbnail').attr('href');
        if (productLink) {
            console.log(`Found product link for ${query}: ${productLink}`);
            const prodHtml = execSync(`curl -sA "Mozilla/5.0" "${productLink}"`).toString();
            const $prod = cheerio.load(prodHtml);
            let imgUrl = $prod('img.js-qv-product-cover').attr('src');
            if (imgUrl) {
               // Get highest quality
               imgUrl = imgUrl.replace(/-[a-z0-9_]+\.jpg/, '-large_default.jpg');
               console.log(`Image URL: ${imgUrl}`);
               execSync(`curl -sA "Mozilla/5.0" -o "./images/${query}.jpg" "${imgUrl}"`);
               console.log(`Saved to ./images/${query}.jpg`);
            } else {
               console.log(`Could not find cover image for ${productLink}`);
            }
        } else {
            console.log(`No results found on site for ${query}`);
        }
    } catch (e) {
        console.error(`Error processing ${query}: ${e.message}`);
    }
}

fetchSearch("PACAL");
fetchSearch("KGPCO403A");
