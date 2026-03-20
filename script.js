// Supabase Configuration
const SUPABASE_URL = 'https://egfurglzwuthkixwrvou.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZnVyZ2x6d3V0aGtpeHdydm91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NDY4OTEsImV4cCI6MjA4OTUyMjg5MX0.pjsQlCYIpx03CbkYcrO1I33zeyzEXCbrr8xMXEW3WPc';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let catalog = []; 

// Performance Utils
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// =========================================
// ALFA CAR AUDIO - Haute Couture Script
// =========================================

const CONFIG = {
    whatsappNumber: "523315686159",
    whatsappDefaultMsg: "Hola, me interesa obtener más información sobre sus sistemas de audio premium."
};

function initAOS() {
    let aosInitialized = false;
    const fallbackTimeout = setTimeout(() => {
        if (!aosInitialized) {
            document.querySelectorAll('[data-aos]').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
                el.style.visibility = 'visible';
            });
        }
    }, 2500);

    try {
        if (typeof AOS !== 'undefined') {
            AOS.init({ duration: 600, once: true, offset: 20, disable: 'mobile' });
            aosInitialized = true;
            clearTimeout(fallbackTimeout);
        }
    } catch (e) {
        console.error("Error initializing AOS:", e);
    }
}

function handleImageError(img) {
    if (!img) return;
    img.onerror = null;
    img.src = 'PHOTO-2026-02-20-13-37-44.jpg';
    img.classList.add('img-placeholder');
}

function initNavbar() {
    const navbar = document.getElementById('navbar');
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (!navbar) return;
    const updateHeaderHeight = () => {
        document.documentElement.style.setProperty('--header-height', `${navbar.offsetHeight}px`);
    };
    window.addEventListener('resize', throttle(updateHeaderHeight, 200));
    updateHeaderHeight();
    window.addEventListener('scroll', throttle(() => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    }, 100));
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => { navLinks.classList.toggle('active'); });
    }
}

function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                faqItems.forEach(i => i.classList.remove('active'));
                if (!isActive) item.classList.add('active');
            });
        }
    });
}

function initWhatsAppLinks() {
    const waParams = `?text=${encodeURIComponent(CONFIG.whatsappDefaultMsg)}`;
    const floatWa = document.getElementById('floating-wa');
    const footerWa = document.getElementById('footer-wa-link');
    if (floatWa) floatWa.href = `https://wa.me/${CONFIG.whatsappNumber}${waParams}`;
    if (footerWa) footerWa.href = `https://wa.me/${CONFIG.whatsappNumber}${waParams}`;
}

const categoryMap = {
    iluminacion: ["LED", "ILUMINACION", "ILUMINACIÓN", "FOCO", "LUPA", "XENON", "FARO"],
    seguridad: ["ALARMA", "SEGURIDAD", "SENSOR", "CAMARA", "GPS", "CERRADURA", "RADAR"],
    audio: ["AUDIO", "AMPLIFICADOR", "SUBWOOFER", "BOCINA", "ESTEREO", "TWEETER", "PROCESADOR"]
};

function normalizeText(text) {
    if (!text) return "";
    return text.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function getMainMenuForCategory(catName) {
    const uCat = normalizeText(catName);
    for (const [main, keywords] of Object.entries(categoryMap)) {
        if (keywords.some(kw => uCat.includes(normalizeText(kw)))) return main;
    }
    return "audio";
}

function initMegaMenu(data) {
    if (!data) return;
    const categoriesSet = new Set();
    data.forEach(item => { if (item.categoria && item.sku !== '_CONFIG_PROMOS_') categoriesSet.add(item.categoria.trim()); });

    const menuGroups = { iluminacion: [], audio: [], seguridad: [] };
    Array.from(categoriesSet).sort().forEach(cat => {
        const mainKey = getMainMenuForCategory(cat);
        if (menuGroups[mainKey]) menuGroups[mainKey].push(cat);
    });

    ['iluminacion', 'audio', 'seguridad'].forEach(mainKey => {
        const dropEl = document.getElementById(`drop-${mainKey}`);
        if (dropEl) {
            dropEl.innerHTML = '';
            menuGroups[mainKey].forEach(subCat => {
                const a = document.createElement('a');
                a.href = "#";
                a.className = "dropdown-link";
                a.textContent = subCat.toUpperCase();
                a.onclick = (e) => { e.preventDefault(); handleSpaNavigation(subCat, 'category'); };
                dropEl.appendChild(a);
            });
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.onclick = (e) => {
            if (e.target.closest('.nav-chevron')) return;
            e.preventDefault();
            const cat = link.getAttribute('data-cat');
            if (cat) handleSpaNavigation(cat, 'mainCategory');
        };
    });
}

function handleSpaNavigation(value, type) {
    if (window.ALFA_PAGE_MODE !== 'HOME') {
        window.location.href = `index.html?${type}=${encodeURIComponent(value)}`;
        return;
    }
    const hero = document.getElementById('hero-section');
    const featured = document.getElementById('featured-products');
    const catalogSection = document.getElementById('catalog-section');
    const grid = document.getElementById('gallery-grid');
    const catalogTitle = document.getElementById('catalog-title');

    if (hero) hero.style.display = 'none';
    if (featured) featured.style.display = 'none';
    if (catalogSection) {
        catalogSection.style.display = 'block';
        window.scrollTo({ top: catalogSection.offsetTop - 50, behavior: 'smooth' });
    }
    if (grid) grid.innerHTML = '';
    let filtered = [];
    if (type === 'category') filtered = catalog.filter(p => normalizeText(p.categoria) === normalizeText(value));
    else if (type === 'mainCategory') {
        const keywords = categoryMap[value] || [];
        filtered = catalog.filter(p => keywords.some(kw => normalizeText(p.categoria || '').includes(normalizeText(kw))));
    } else if (type === 'search') {
        const term = normalizeText(value);
        filtered = catalog.filter(p => 
            normalizeText(p.nombre).includes(term) || 
            normalizeText(p.sku).includes(term) || 
            normalizeText(p.categoria).includes(term)
        );
    } else if (type === 'all') filtered = catalog;

    if (catalogTitle) catalogTitle.textContent = type === 'search' ? `RESULTADOS PARA: "${value.toUpperCase()}"` : value.toUpperCase();
    renderProducts(filtered, grid);
}

async function loadCatalogRouter() {
    const mode = window.ALFA_PAGE_MODE || 'HOME';
    const spinner = document.getElementById('loading-spinner');
    try {
        const { data, error } = await _supabase.from('catalog').select('*').order('nombre', { ascending: true });
        if (error) throw error;
        
        // Separamos productos de config
        catalog = data.filter(p => !p.sku.startsWith('_CONFIG_'));
        const configPromos = data.find(p => p.sku === '_CONFIG_PROMOS_');
        
        if (spinner) spinner.style.display = 'none';

        if (mode === 'HOME') loadHome(catalog, configPromos);
        else if (mode === 'TIENDA') loadTienda(catalog);
        else if (mode === 'PRODUCT') loadProductDetails(catalog);
        
        initSmartSearch(catalog, document.getElementById('gallery-grid'));
    } catch (err) {
        console.error(err);
        if (spinner) spinner.style.display = 'none';
    }
}

function loadHome(data, config) {
    const grid = document.getElementById('featured-grid');
    if (!grid) return;
    
    let featured = [];
    if (config && config.descripcion) {
        const skus = config.descripcion.split(',').map(s => s.trim());
        featured = data.filter(p => skus.includes(p.sku));
        // Ordenamos segun el orden del config
        featured.sort((a, b) => skus.indexOf(a.sku) - skus.indexOf(b.sku));
    }

    renderProducts(featured.length ? featured : data.slice(0, 3), grid);
    initMegaMenu(data);
}

function loadTienda(data) {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    const params = new URLSearchParams(window.location.search);
    const filterParam = params.get('filter');
    if (filterParam) {
        const keywords = categoryMap[filterParam] || [filterParam];
        const filtered = data.filter(item => keywords.some(kw => normalizeText(item.categoria || '').includes(normalizeText(kw))));
        renderProducts(filtered, grid);
    } else {
        const q = params.get('q');
        if (q) {
            const term = normalizeText(q);
            const filtered = data.filter(p => 
                normalizeText(p.nombre).includes(term) || 
                normalizeText(p.sku).includes(term) || 
                normalizeText(p.categoria).includes(term)
            );
            renderProducts(filtered, grid);
        } else {
            renderProducts(data, grid);
        }
    }
}

let currentPage = 1;
const ITEMS_PER_PAGE = 24;

function renderProducts(products, container) {
    if (!container) return;
    container.innerHTML = '';
    currentPage = 1;

    const showMore = () => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const pageItems = products.slice(start, end);

        pageItems.forEach(product => {
            const card = document.createElement('a');
            card.className = 'product-card';
            card.href = `producto.html?sku=${encodeURIComponent(product.sku)}`;
            const priceDisplay = product.precio ? `<span>$</span>${product.precio}` : 'Consultar precio';
            
            card.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.image_url || 'PHOTO-2026-02-20-13-37-44.jpg'}" 
                         class="product-img" loading="lazy" onerror="handleImageError(this)">
                </div>
                <div class="product-info">
                    <div class="product-category">${product.categoria || 'ALFA'}</div>
                    <h3 class="product-name">${product.nombre}</h3>
                    <div class="price-row"><span class="product-price">${priceDisplay}</span></div>
                </div>`;
            container.appendChild(card);
        });

        if (products.length > end) {
            let btn = document.getElementById('btn-load-more');
            if (!btn) {
                btn = document.createElement('button');
                btn.id = 'btn-load-more';
                btn.className = 'btn-red';
                btn.style.gridColumn = '1 / -1';
                btn.style.margin = '40px auto';
                btn.textContent = 'VER MÁS PRODUCTOS';
                btn.onclick = () => { currentPage++; showMore(); };
                container.after(btn);
            }
        } else {
            const btn = document.getElementById('btn-load-more');
            if (btn) btn.remove();
        }
        if (typeof AOS !== 'undefined') AOS.refresh();
    };
    showMore();
}

function initSmartSearch(data) {
    const searchInput = document.getElementById('header-search-input');
    const suggestionsEl = document.getElementById('search-suggestions');
    if (!searchInput || !suggestionsEl) return;

    searchInput.addEventListener('input', throttle((e) => {
        const term = e.target.value.toLowerCase().trim();
        if (term.length < 2) { suggestionsEl.classList.remove('active'); return; }
        const matches = data.filter(p => normalizeText(p.nombre).includes(term) || normalizeText(p.sku).includes(term)).slice(0, 5);
        
        let html = '';
        if (matches.length > 0) {
            html += `<div class="suggestion-item search-all" onclick="handleSpaNavigation('${term}', 'search')">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <div class="suggestion-info"><strong>Ver todos los resultados para "${term}"</strong></div>
                    </div>`;
            
            html += matches.map(p => `
                <div class="suggestion-item" onclick="window.location.href='producto.html?sku=${p.sku}'">
                    <img src="${p.image_url || ''}" class="suggestion-img" onerror="this.src='PHOTO-2026-02-20-13-37-44.jpg'">
                    <div class="suggestion-info"><span>${p.nombre}</span><small>${p.sku}</small></div>
                </div>`).join('');
            
            suggestionsEl.innerHTML = html;
            suggestionsEl.classList.add('active');
        } else {
            suggestionsEl.innerHTML = `<div class="suggestion-item no-results">No se encontraron resultados</div>`;
            suggestionsEl.classList.add('active');
        }
    }, 300));

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const term = searchInput.value.trim();
            if (term.length >= 2) {
                suggestionsEl.classList.remove('active');
                handleSpaNavigation(term, 'search');
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsEl.contains(e.target)) {
            suggestionsEl.classList.remove('active');
        }
    });
}

function loadProductDetails(data) {
    const sku = new URLSearchParams(window.location.search).get('sku');
    const container = document.getElementById('single-product-container');
    const errorEl = document.getElementById('error-state');
    const spinner = document.getElementById('loading-spinner');

    if (!sku) {
        if (spinner) spinner.style.display = 'none';
        if (errorEl) errorEl.style.display = 'block';
        return;
    }

    const p = data.find(p => String(p.sku).toLowerCase() === decodeURIComponent(sku).toLowerCase());
    
    if (spinner) spinner.style.display = 'none';

    if (!p) {
        if (errorEl) errorEl.style.display = 'block';
        return;
    }

    // Populate fields
    const spImg = document.getElementById('sp-img');
    const spTitle = document.getElementById('sp-title');
    const spCat = document.getElementById('sp-category');
    const spSku = document.getElementById('sp-sku-val');
    const spPrice = document.getElementById('sp-price');
    const spDesc = document.getElementById('sp-desc-val');
    const spWaBtn = document.getElementById('sp-wa-btn');

    if (spImg) spImg.src = p.image_url || 'PHOTO-2026-02-20-13-37-44.jpg';
    if (spTitle) spTitle.textContent = p.nombre;
    if (spCat) spCat.textContent = p.categoria || 'ALFA';
    if (spSku) spSku.textContent = p.sku;
    if (spPrice) spPrice.innerHTML = p.precio ? `<span>$</span>${p.precio}` : 'Consultar precio';
    if (spDesc) spDesc.innerHTML = (p.descripcion || 'Producto de alto rendimiento ALFA Car Audio. Diseñado para ofrecer la mejor experiencia sonora y durabilidad en tu vehículo.').replace(/\n/g, '<br>');

    const waMsg = encodeURIComponent(`Hola ALFA Car Audio, me interesa el producto: ${p.nombre} (SKU: ${p.sku})`);
    const waUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${waMsg}`;
    if (spWaBtn) spWaBtn.href = waUrl;

    // Mobile Sticky CTA
    const mscPrice = document.getElementById('msc-price');
    const mscWaBtn = document.getElementById('msc-wa-btn');
    if (mscPrice) mscPrice.innerHTML = p.precio ? `<span>$</span>${p.precio}` : 'Consultar';
    if (mscWaBtn) mscWaBtn.href = waUrl;

    // Show main container
    if (container) {
        container.style.display = 'grid';
        if (typeof AOS !== 'undefined') AOS.refresh();
    }

    // Load related
    loadRelatedProducts(p, data);
}

function loadRelatedProducts(currentProd, allData) {
    const relatedSection = document.getElementById('related-products-section');
    const relatedGrid = document.getElementById('related-grid');
    if (!relatedSection || !relatedGrid) return;

    const related = allData.filter(p => 
        p.categoria === currentProd.categoria && p.sku !== currentProd.sku
    ).slice(0, 4);

    if (related.length > 0) {
        relatedSection.style.display = 'block';
        renderProducts(related, relatedGrid);
        
        // Hide "Ver más" in related grid if it appears
        setTimeout(() => {
            const btn = relatedGrid.parentElement.querySelector('#btn-load-more');
            if (btn) btn.style.display = 'none';
        }, 100);
    }
}

function initParallax() {
    const massiveCards = document.querySelectorAll('.massive-card');
    if (!massiveCards.length) return;
    window.addEventListener('scroll', throttle(() => {
        massiveCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const bg = card.querySelector('.mc-bg');
                if (bg) {
                    const offset = (rect.top + rect.height/2 - window.innerHeight/2) * -0.1;
                    bg.style.transform = `translateY(${offset}px) scale(1.05)`;
                }
            }
        });
    }, 50));
}

function initUniverseClicks() {
    document.querySelectorAll('.clickable-universe').forEach(item => {
        item.onclick = (e) => {
            e.preventDefault();
            const universe = item.getAttribute('data-universe');
            if (universe) {
                handleSpaNavigation(universe, 'mainCategory');
            }
        };
    });
}

function initSplashScreen() {
    const splash = document.getElementById('splash-screen');
    if (splash) {
        const hideSplash = () => {
            splash.classList.add('hidden');
            setTimeout(() => splash.style.display = 'none', 800);
        };
        if (window.ALFA_PAGE_MODE !== 'HOME') splash.style.display = 'none';
        else setTimeout(hideSplash, 1500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initSplashScreen();
    initAOS();
    initNavbar();
    initFAQ();
    initWhatsAppLinks();
    loadCatalogRouter();
    initParallax();
    initUniverseClicks();
    const btnLock = document.getElementById('btn-cuenta');
    if (btnLock) btnLock.onclick = () => window.location.href = 'login.html';
});
