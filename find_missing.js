const fs = require('fs');
const code = fs.readFileSync('catalog.js', 'utf8');
let catalog;
eval(code.replace('const catalog =', 'catalog ='));

const categoryWords = ["alarma", "segurid"];
const items = catalog.filter(p => p.category && categoryWords.some(w => p.category.toLowerCase().includes(w)));
let missing = [];
items.forEach(p => {
    const imgPath = p.image.replace(/^images\//, "./images/");
    // Also check images_alfaperf
    const fallbackPath = `./images_alfaperf/${p.sku}.jpg`;
    if (!fs.existsSync(imgPath) && !fs.existsSync(fallbackPath) && !fs.existsSync(imgPath.replace('.jpg', '.png'))) {
        missing.push(p);
    }
});
console.log("Missing images:");
missing.forEach(m => console.log(`- ${m.name} (${m.sku}) -> ${m.image}`));
