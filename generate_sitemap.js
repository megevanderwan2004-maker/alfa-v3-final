import fs from 'fs';
import path from 'path';
import axios from 'axios';

const BASE_URL = 'https://alfacaraudiomx.com';
const SUPABASE_URL = 'https://egfurglzwuthkixwrvou.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZnVyZ2x6d3V0aGtpeHdydm91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NDY4OTEsImV4cCI6MjA4OTUyMjg5MX0.pjsQlCYIpx03CbkYcrO1I33zeyzEXCbrr8xMXEW3WPc';

// Files to exclude from sitemap
const EXCLUDED_FILES = [
    'admin.html',
    'login.html',
    'gracias.html',
    'article.html',
    'producto.html',
    'admin.js',
    'server.js',
    'article.js',
    'blog.js',
    'catalog.js',
    'script.js'
];

async function generateSitemap() {
    console.log('--- Starting Sitemap Generation ---');
    
    let urls = [];

    // 1. Static Pages
    const files = fs.readdirSync('./');
    const htmlFiles = files.filter(file => file.endsWith('.html') && !EXCLUDED_FILES.includes(file) && !file.includes('_content.html'));

    htmlFiles.forEach(file => {
        let priority = 0.8;
        if (file === 'index.html') priority = 1.0;
        else if (['blog.html', 'tienda.html'].includes(file)) priority = 0.9;
        
        const loc = file === 'index.html' ? BASE_URL : `${BASE_URL}/${file}`;
        urls.push({
            loc: loc,
            lastmod: new Date().toISOString().split('T')[0],
            priority: priority.toFixed(2)
        });
    });

    // 2. Fetch Blog Articles from Supabase
    try {
        console.log('Fetching blog articles...');
        const blogResponse = await axios.get(`${SUPABASE_URL}/rest/v1/blog_articles?published=eq.true&select=slug,created_at`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });

        if (blogResponse.data) {
            blogResponse.data.forEach(article => {
                urls.push({
                    loc: `${BASE_URL}/article.html?slug=${article.slug}`,
                    lastmod: new Date(article.created_at).toISOString().split('T')[0],
                    priority: '0.70'
                });
            });
        }
    } catch (error) {
        console.error('Error fetching blog articles:', error.message);
    }

    // 3. Fetch Products from Supabase
    try {
        console.log('Fetching products...');
        const productResponse = await axios.get(`${SUPABASE_URL}/rest/v1/catalog?select=sku,updated_at`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });

        if (productResponse.data) {
            productResponse.data.forEach(product => {
                if (product.sku && !product.sku.startsWith('_CONFIG_')) {
                    urls.push({
                        loc: `${BASE_URL}/producto.html?sku=${encodeURIComponent(product.sku)}`,
                        lastmod: product.updated_at ? new Date(product.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                        priority: '0.60'
                    });
                }
            });
        }
    } catch (error) {
        console.error('Error fetching products:', error.message);
    }

    // 4. Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- Generated automatically for ALFA Car Audio -->
${urls.map(url => `    <url>
        <loc>${url.loc}</loc>
        <lastmod>${url.lastmod}</lastmod>
        <priority>${url.priority}</priority>
    </url>`).join('\n')}
</urlset>`;

    fs.writeFileSync('sitemap.xml', xml);
    console.log(`--- Sitemap successfully generated with ${urls.length} links ---`);
}

generateSitemap();
