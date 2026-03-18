const axiosOrig = require('axios');
const axios = axiosOrig.create({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
});
const cheerio = require('cheerio');

async function test() {
    try {
        const res = await axios.get('https://alfaperformance.mx/relays/451-kit-relay-de-5-patas-alfa-con-arnes-y-conector-40a.html');
        require('fs').writeFileSync('test_product.html', res.data);
        console.log("Saved test_product.html");
    } catch(e) {
        console.error(e);
    }
}
test();
