// =========================================
// ALFA CAR AUDIO - Haute Couture Script
// =========================================

const CONFIG = {
    whatsappNumber: "523315686159",
    whatsappDefaultMsg: "Hola, me interesa obtener más información sobre sus sistemas de audio premium."
};

/**
 * 1. AOS Initialization with Fallback Safety
 */
function initAOS() {
    let aosInitialized = false;

    // Set a timeout to remove AOS hidden states if it fails to init within 2.5s
    const fallbackTimeout = setTimeout(() => {
        if (!aosInitialized) {
            console.warn("AOS initialization timeout. Applying safety fallback.");
            document.querySelectorAll('[data-aos]').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
                el.style.visibility = 'visible';
                el.style.transition = 'opacity 0.5s ease';
            });
            const aosStylesheet = document.querySelector('link[href*="aos.css"]');
            if (aosStylesheet) aosStylesheet.disabled = true;
        }
    }, 2500);

    // Attempt to init AOS
    try {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                once: true,
                offset: 50,
                disable: 'mobile'
            });
            aosInitialized = true;
            clearTimeout(fallbackTimeout);
        }
    } catch (e) {
        console.error("Error initializing AOS:", e);
    }
}

/**
 * 2. IMAGE ERROR HANDLER (Failsafe)
 */
function handleImageError(img) {
    if (!img) return;

    // Extensions to try
    const extensions = ['.jpg', '.png', '.jpeg', '.webp'];

    // Get current retry state
    let retryIndex = parseInt(img.getAttribute('data-retry-index') || '-1');
    retryIndex++;

    const originalSrc = img.getAttribute('data-original-original-src') || img.src;
    if (!img.getAttribute('data-original-original-src')) {
        img.setAttribute('data-original-original-src', img.src);
    }

    if (retryIndex < extensions.length) {
        img.setAttribute('data-retry-index', retryIndex);

        // Try to replace the existing extension with the next one
        const basePath = originalSrc.substring(0, originalSrc.lastIndexOf('.'));
        img.src = basePath + extensions[retryIndex];
        return;
    }

    // If all extensions fail, try a simplified name (remove suffixes like .1D, .5D)
    if (!img.getAttribute('data-simplified-tried')) {
        img.setAttribute('data-simplified-tried', 'true');
        img.setAttribute('data-retry-index', '-1'); // Reset extensions for the simplified name

        let newBasePath = originalSrc.substring(0, originalSrc.lastIndexOf('.'));
        // Remove common suffixes used in SKUs but not always in filenames
        newBasePath = newBasePath.replace(/\.[0-9].*$/, '').replace(/D$/, '');

        img.src = newBasePath + '.jpg';
        return;
    }

    // Final Fallback: Default Logo
    img.onerror = null; // Prevent infinite loop
    img.src = 'PHOTO-2026-02-20-13-37-44.jpg';
    img.classList.add('img-placeholder');
}

/**
 * 3. Navigation Utilities
 */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Dropdown Logic removed because the main Navigation is now Header Grid. 
    // The specific categories exist in Tienda context now.
}

/**
 * 2.1 FAQ Accordion Logic
 */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Close all other items
                faqItems.forEach(i => i.classList.remove('active'));

                // Toggle current
                if (!isActive) item.classList.add('active');
            });
        }
    });
}

/**
 * UTILS - Mega Menu & SPA Architecture (Phase 7)
 */
const categoryMap = {
    iluminacion: ["LED", "ILUMINACION", "ILUMINACIÓN", "FOCO", "LUPA", "XENON", "FARO"],
    seguridad: ["ALARMA", "SEGURIDAD", "SENSOR", "CAMARA", "GPS", "CERRADURA", "RADAR"],
    audio: ["AUDIO", "AMPLIFICADOR", "SUBWOOFER", "BOCINA", "ESTEREO", "TWEETER", "PROCESADOR"]
};

function normalizeText(text) {
    if (!text) return "";
    return text.toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
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

    // 1. Extract and map unique categories
    const categoriesSet = new Set();
    data.forEach(item => {
        if (item.categoria && item.categoria.trim() !== '') {
            categoriesSet.add(item.categoria.trim());
        }
    });

    const uniqueCategories = Array.from(categoriesSet).sort();
    const menuGroups = { iluminacion: [], audio: [], seguridad: [] };

    uniqueCategories.forEach(cat => {
        const mainKey = getMainMenuForCategory(cat);
        if (menuGroups[mainKey]) {
            menuGroups[mainKey].push(cat);
        }
    });

    // 2. Inject HTML into Dropdowns
    ['iluminacion', 'audio', 'seguridad'].forEach(mainKey => {
        const dropEl = document.getElementById(`drop-${mainKey}`);
        if (dropEl) {
            dropEl.innerHTML = '';
            menuGroups[mainKey].forEach(subCat => {
                const a = document.createElement('a');
                a.href = "#";
                a.className = "dropdown-link";
                a.textContent = subCat.toUpperCase();
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleSpaNavigation(subCat, 'category');
                });
                dropEl.appendChild(a);
            });
        }
    });

    // Main links click handler (show all for that section)
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const cat = e.target.getAttribute('data-cat');
            if (cat) {
                handleSpaNavigation(cat, 'mainCategory');
            }
        });
    });

    // Sub-buttons on page
    const exploreBtn = document.getElementById('btn-explore-catalog');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            handleSpaNavigation('all', 'all');
        });
    }
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

        const backBtn = document.getElementById('btn-back-to-home');
        if (backBtn) {
            backBtn.onclick = () => {
                catalogSection.style.display = 'none';
                if (hero) hero.style.display = 'block';
                if (featured) featured.style.display = 'block';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
        }
        window.scrollTo({ top: catalogSection.offsetTop - 100, behavior: 'smooth' });
    }

    if (!catalog || !Array.isArray(catalog)) return;
    if (grid) grid.innerHTML = '';

    if (type === 'search') {
        // initSmartSearch handles live input, but for direct SPA navigation (URL/Megamenu)
        const lower = normalizeText(value);
        const filtered = catalog.filter(p =>
            normalizeText(p.nombre).includes(lower) ||
            normalizeText(p.sku).includes(lower) ||
            normalizeText(p.categoria).includes(lower)
        );
        if (catalogTitle) catalogTitle.textContent = `BÚSQUEDA: "${value.toUpperCase()}"`;
        renderProducts(filtered, grid);
    } else if (type === 'category') {
        const filtered = catalog.filter(p => normalizeText(p.categoria) === normalizeText(value));
        if (catalogTitle) catalogTitle.textContent = value.toUpperCase();
        renderProducts(filtered, grid);
    } else if (type === 'mainCategory') {
        const keywords = categoryMap[value] || [];
        const filtered = catalog.filter(p => {
            const uCat = normalizeText(p.categoria || '');
            return keywords.some(kw => uCat.includes(normalizeText(kw)));
        });
        if (catalogTitle) catalogTitle.textContent = value.toUpperCase();
        renderProducts(filtered, grid);
    } else if (type === 'all') {
        if (catalogTitle) catalogTitle.textContent = 'COLECCIÓN COMPLETA';
        renderProducts(catalog, grid);
    }
}

function loadCatalogRouter() {
    const mode = window.ALFA_PAGE_MODE || 'HOME';
    const spinner = document.getElementById('loading-spinner');
    if (spinner) setTimeout(() => spinner.style.display = 'none', 800);

    setTimeout(() => {
        if (typeof catalog === 'undefined' || !Array.isArray(catalog) || catalog.length === 0) {
            const emptyState = document.getElementById('empty-state');
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (mode === 'HOME') {
            loadHome(catalog);
            initSmartSearch(catalog, document.getElementById('gallery-grid'));
        } else if (mode === 'TIENDA') {
            loadTienda(catalog);
            initSmartSearch(catalog, document.getElementById('gallery-grid'));
        } else if (mode === 'PRODUCT') {
            loadProductDetails(catalog);
            initSmartSearch(catalog, null);
        }
    }, 800);
}

/**
 * 4. Home Page Logic
 */
function loadHome(data) {
    const grid = document.getElementById('featured-grid');
    if (!grid) return;

    // Fixed Featured SKUs - Final Selection
    const featuredSkus = ["#KALAL838512", "#KBOALCXPRO80", "#KFOLEALM1H13"];
    const featured = data.filter(p => featuredSkus.includes(String(p.sku).trim()));

    if (featured.length === 0) {
        const randomFeatured = data.slice(0, 3);
        renderProducts(randomFeatured, grid);
    } else {
        renderProducts(featured, grid);
    }

    // Explore Catalog Button
    const exploreBtn = document.getElementById('btn-explore-catalog');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            window.location.href = 'tienda.html';
        });
    }

    // Universes Clickable Logic
    const universeItems = document.querySelectorAll('.universe-item.clickable-universe');
    universeItems.forEach(item => {
        item.addEventListener('click', () => {
            const cat = item.getAttribute('data-universe');
            handleSpaNavigation(cat, 'mainCategory');
        });
    });

    initMegaMenu(data);
}

/**
 * 5. Tienda Page Logic
 */
function loadTienda(data) {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    initDynamicCategories(data, grid);

    const params = new URLSearchParams(window.location.search);
    const filterParam = params.get('filter');

    if (filterParam) {
        // Use mainCategory logic for universe filters
        const keywords = categoryMap[filterParam] || [filterParam];
        const filtered = data.filter(item => {
            const uCat = normalizeText(item.categoria || '');
            return keywords.some(kw => uCat.includes(normalizeText(kw)));
        });
        const catalogTitle = document.getElementById('catalog-title');
        if (catalogTitle) catalogTitle.textContent = filterParam.toUpperCase();
        renderProducts(filtered, grid);
    } else {
        // Only render if not searching (handled by initSmartSearch)
        if (!params.get('q')) renderProducts(data, grid);
    }
}



/**
 * 5. SMART SEARCH ENGINE (Advanced: Autocomplete & Upsell)
 */
function initSmartSearch(data, grid) {
    const searchInput = document.getElementById('header-search-input');
    const suggestionsEl = document.getElementById('search-suggestions');
    if (!searchInput || !suggestionsEl) return;

    let selectedIndex = -1;
    let currentSuggestions = [];

    // Handle initial state if passed via URL
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || params.get('search');
    if (initialQuery) searchInput.value = initialQuery;

    const getScore = (product, query) => {
        let score = 0;
        const normName = normalizeText(product.nombre);
        const normSku = normalizeText(product.sku);
        const normCat = normalizeText(product.categoria);

        if (normSku === query) score += 100;
        else if (normSku.startsWith(query)) score += 80;
        else if (normSku.includes(query)) score += 50;

        if (normName === query) score += 60;
        else if (normName.startsWith(query)) score += 40;
        else if (normName.includes(query)) score += 30;

        if (normCat.includes(query)) score += 20;

        const queryWords = query.split(/\s+/);
        if (queryWords.length > 1) {
            queryWords.forEach(word => {
                if (word.length < 2) return;
                if (normName.includes(word)) score += 5;
                if (normSku.includes(word)) score += 5;
            });
        }
        return score;
    };

    const performSearch = (term) => {
        const query = normalizeText(term);
        suggestionsEl.classList.remove('active');

        if (!query) {
            if (window.ALFA_PAGE_MODE === 'TIENDA') renderProducts(data, grid);
            return;
        }

        const scoredResults = data.map(product => ({
            product,
            score: getScore(product, query)
        }))
            .filter(res => res.score > 0)
            .sort((a, b) => b.score - a.score);

        const results = scoredResults.map(res => res.product);

        // Advanced Rendering: Perfect Match + Upsell
        renderAdvancedResults(scoredResults, grid);

        // UI Handling
        const catalogTitle = document.getElementById('catalog-title');
        if (catalogTitle) {
            catalogTitle.textContent = term ? `BÚSQUEDA: "${term.toUpperCase()}"` : 'RESULTADOS';
        }

        // Home SPA transition
        if (window.ALFA_PAGE_MODE === 'HOME' && term.length > 0) {
            const hero = document.getElementById('hero-section');
            const featured = document.getElementById('featured-products');
            const catalogSection = document.getElementById('catalog-section');
            if (hero) hero.style.display = 'none';
            if (featured) featured.style.display = 'none';
            if (catalogSection) catalogSection.style.display = 'block';
        }
    };

    const updateSuggestions = (term) => {
        const query = normalizeText(term);
        if (query.length < 2) {
            suggestionsEl.classList.remove('active');
            return;
        }

        currentSuggestions = data.map(product => ({
            product,
            score: getScore(product, query)
        }))
            .filter(res => res.score > 10) // Minimum threshold for suggestions
            .sort((a, b) => b.score - a.score)
            .slice(0, 6)
            .map(res => res.product);

        if (currentSuggestions.length > 0) {
            suggestionsEl.innerHTML = currentSuggestions.map((p, idx) => `
                <div class="suggestion-item" data-index="${idx}">
                    <img src="${p.imagePath || ''}" class="suggestion-img" onerror="handleImageError(this)">
                    <div class="suggestion-info">
                        <span class="suggestion-name">${p.nombre}</span>
                        <span class="suggestion-meta">${p.categoria} | SKU: ${p.sku}</span>
                    </div>
                </div>
            `).join('');
            suggestionsEl.classList.add('active');
            selectedIndex = -1;
        } else {
            suggestionsEl.classList.remove('active');
        }
    };

    searchInput.addEventListener('input', (e) => {
        updateSuggestions(e.target.value);
    });

    searchInput.addEventListener('keydown', (e) => {
        const items = suggestionsEl.querySelectorAll('.suggestion-item');
        if (e.key === 'ArrowDown') {
            selectedIndex = (selectedIndex + 1) % items.length;
            highlightSuggestion(items);
            e.preventDefault();
        } else if (e.key === 'ArrowUp') {
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
            highlightSuggestion(items);
            e.preventDefault();
        } else if (e.key === 'Enter') {
            if (selectedIndex > -1) {
                const p = currentSuggestions[selectedIndex];
                searchInput.value = p.nombre;
                performSearch(p.nombre);
            } else {
                performSearch(searchInput.value);
            }
            suggestionsEl.classList.remove('active');
        } else if (e.key === 'Escape') {
            suggestionsEl.classList.remove('active');
        }
    });

    const highlightSuggestion = (items) => {
        items.forEach((item, idx) => {
            item.classList.toggle('selected', idx === selectedIndex);
        });
        if (selectedIndex > -1) {
            items[selectedIndex].scrollIntoView({ block: 'nearest' });
        }
    };

    suggestionsEl.addEventListener('click', (e) => {
        const item = e.target.closest('.suggestion-item');
        if (item) {
            const idx = item.getAttribute('data-index');
            const p = currentSuggestions[idx];
            searchInput.value = p.nombre;
            performSearch(p.nombre);
        }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsEl.contains(e.target)) {
            suggestionsEl.classList.remove('active');
        }
    });

    if (initialQuery) performSearch(initialQuery);
}

function renderAdvancedResults(scoredResults, grid) {
    const perfectArea = document.getElementById('perfect-match-area');
    const upsellSection = document.getElementById('upsell-section');
    const upsellCarousel = document.getElementById('upsell-carousel');

    if (!perfectArea || !grid) return;

    if (scoredResults.length === 0) {
        perfectArea.style.display = 'none';
        upsellSection.style.display = 'none';
        renderProducts([], grid);
        return;
    }

    // 1. Perfect Match (highest score)
    const perfect = scoredResults[0].product;
    perfectArea.innerHTML = `
        <div class="perfect-match-card" data-aos="fade-right">
            <img src="${perfect.imagePath || ''}" class="pm-image" onerror="handleImageError(this)">
            <div class="pm-content">
                <div class="pm-category">${perfect.categoria}</div>
                <h2 class="pm-name">${perfect.nombre}</h2>
                <div class="pm-price"><span>$</span>${perfect.precio || 'Consultar'}</div>
                <a href="producto.html?sku=${encodeURIComponent(perfect.sku)}" class="btn-primary">VER DETALLES</a>
            </div>
        </div>
    `;
    perfectArea.style.display = 'block';

    // 2. Upsell Generation
    // Same category, higher price preferred
    const pPrice = parseFloat(perfect.precio) || 0;
    const upsellProducts = catalog.filter(p =>
        p.categoria === perfect.categoria &&
        p.sku !== perfect.sku &&
        (parseFloat(p.precio) >= pPrice)
    ).slice(0, 8);

    if (upsellProducts.length > 0) {
        upsellCarousel.innerHTML = '';
        upsellProducts.forEach(p => {
            const item = document.createElement('div');
            item.className = 'upsell-item';
            // Simple card for carousel
            item.innerHTML = `
                <a href="producto.html?sku=${encodeURIComponent(p.sku)}" class="product-card">
                    <div class="product-image-container">
                        <img src="${p.imagePath}" class="product-img" onerror="handleImageError(this)">
                    </div>
                    <div class="product-info">
                        <h4 class="product-name" style="font-size:0.8rem;">${p.nombre}</h4>
                        <span class="product-price" style="font-size:0.9rem;">$${p.precio || 'Consultar'}</span>
                    </div>
                </a>
            `;
            upsellCarousel.appendChild(item);
        });
        upsellSection.style.display = 'block';
        initCarouselControls();
    } else {
        upsellSection.style.display = 'none';
    }

    // 3. Other Results
    const others = scoredResults.slice(1).map(res => res.product);
    renderProducts(others, grid);
}

function initCarouselControls() {
    const carousel = document.getElementById('upsell-carousel');
    const prev = document.getElementById('upsell-prev');
    const next = document.getElementById('upsell-next');
    if (!carousel || !prev || !next) return;

    prev.onclick = () => carousel.scrollBy({ left: -300, behavior: 'smooth' });
    next.onclick = () => carousel.scrollBy({ left: 300, behavior: 'smooth' });
}

/**
 * 6. Product Details Logic
 */
function loadProductDetails(data) {
    const params = new URLSearchParams(window.location.search);
    const sku = params.get('sku');

    const containerEl = document.getElementById('single-product-container');
    const errorEl = document.getElementById('error-state');

    if (!sku) {
        if (errorEl) errorEl.style.display = 'block';
        return;
    }

    const decodedSku = decodeURIComponent(sku).trim().toLowerCase();
    const product = data.find(p => String(p.sku).trim().toLowerCase() === decodedSku);

    if (!product) {
        if (errorEl) errorEl.style.display = 'block';
        return;
    }

    if (containerEl) {
        containerEl.style.display = 'flex';
        const imgSrc = product.imagePath && product.imagePath.trim() !== "" ? product.imagePath : '';
        document.getElementById('sp-img').src = imgSrc;
        document.getElementById('sp-img').onerror = function () { handleImageError(this); };
        document.getElementById('sp-title').textContent = product.nombre || 'Producto';
        document.getElementById('sp-category').textContent = product.categoria || 'GENERAL';
        document.getElementById('sp-sku-val').textContent = product.sku || 'N/A';

        let priceDisplay = product.precio || 'Consultar';
        let prefix = product.precio ? '<span>$</span>' : '';
        document.getElementById('sp-price').innerHTML = prefix + priceDisplay;

        const mscPrice = document.getElementById('msc-price');
        if (mscPrice) mscPrice.innerHTML = prefix + priceDisplay;

        const defaultDesc = 'Producto de alta calidad para su vehículo, garantizado por ALFA Car Audio. Rendimiento superior y durabilidad excepcional para los usuarios más exigentes.';
        document.getElementById('sp-desc-val').textContent = product.descripcion || product.description || defaultDesc;

        const waMsg = encodeURIComponent(`Hola, estoy interesado en el producto ${product.nombre} (SKU: ${product.sku || 'N/A'}). ¿Tienen disponibilidad?`);
        const waLink = `https://wa.me/${CONFIG.whatsappNumber}?text=${waMsg}`;

        const spWaBtn = document.getElementById('sp-wa-btn');
        if (spWaBtn) spWaBtn.href = waLink;

        const mscWaBtn = document.getElementById('msc-wa-btn');
        if (mscWaBtn) mscWaBtn.href = waLink;

        // Related Products
        const relatedGrid = document.getElementById('related-grid');
        const relatedSection = document.getElementById('related-products-section');
        if (relatedGrid && relatedSection) {
            const related = data.filter(p => p.categoria === product.categoria && p.sku !== product.sku).slice(0, 3);
            if (related.length > 0) {
                renderProducts(related, relatedGrid);
                relatedSection.style.display = 'block';
            }
        }
    }
}

/**
 * UTILS - Render Products HTML
 * "isHero" flag forces larger cards via CSS if needed
 */
function renderProducts(products, container, isHero = false) {
    container.innerHTML = '';
    const emptyState = document.getElementById('empty-state');

    if (!products || products.length === 0) {
        container.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    container.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    products.forEach((product, index) => {
        const card = document.createElement('a');
        card.className = 'product-card';
        card.href = `producto.html?sku=${encodeURIComponent(product.sku)}`;
        // Extender el AOS Delay a módulos de 8 para una cascada más larga (800ms max)
        const delay = (index % 8) * 100;
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', delay);

        const imgSrc = product.imagePath && product.imagePath.trim() !== "" ? product.imagePath : '';

        // Determinar prefijo y estilos para precio
        let priceDisplay = '';
        if (product.precio && product.precio !== 0 && product.precio !== "0") {
            priceDisplay = `<span>$</span>${product.precio}`;
        } else {
            priceDisplay = 'Consultar precio';
        }

        card.innerHTML = `
            <div class="product-image-container" style="position:relative;">
                <img src="${imgSrc}" alt="${product.nombre}" class="product-img" loading="lazy" onerror="handleImageError(this)">
                <div class="img-fallback" style="display: ${imgSrc ? 'none' : 'flex'};">Imagen no disponible</div>
            </div>
            <div class="product-info">
                <div class="product-category">${product.categoria || 'N/A'}</div>
                <h3 class="product-name">${product.nombre}</h3>
                <div class="product-details">
                    <p class="product-sku">Ref: ${product.sku || 'N/A'}</p>
                    <div class="price-row">
                        <span class="product-price">${priceDisplay}</span>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    // Refresh AOS instances mostly for dynamic injecting
    if (typeof AOS !== 'undefined') {
        setTimeout(() => {
            AOS.refresh();
        }, 100);
    }
}



function initWhatsAppLinks() {
    const waParams = `?text=${encodeURIComponent(CONFIG.whatsappDefaultMsg)}`;
    const floatWa = document.getElementById('floating-wa');
    const footerWa = document.getElementById('footer-wa-link');

    if (floatWa) floatWa.href = `https://wa.me/${CONFIG.whatsappNumber}${waParams}`;
    if (footerWa) footerWa.href = `https://wa.me/${CONFIG.whatsappNumber}${waParams}`;
}

/**
 * 4. Admin Auth
 */
function initAdminAuth() {
    const modal = document.getElementById('login-modal');
    const btnCuenta = document.getElementById('btn-cuenta');
    const closeBtn = document.querySelector('.close-modal');
    const submitBtn = document.getElementById('btn-login-submit');
    const inputPass = document.getElementById('admin-password');
    const errorMsg = document.getElementById('login-error');

    if (!modal || !btnCuenta) return;

    btnCuenta.addEventListener('click', () => {
        modal.classList.add('active');
        if (inputPass) inputPass.value = '';
        if (errorMsg) errorMsg.textContent = '';
        setTimeout(() => inputPass && inputPass.focus(), 100);
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    function doLogin() {
        const pswd = inputPass.value;
        if (pswd === 'alfacaraudio2026!') {
            sessionStorage.setItem('alfa_admin_auth', 'true');
            window.location.href = 'admin.html';
        } else {
            if (errorMsg) errorMsg.textContent = 'Acceso Denegado. Código incorrecto.';
            inputPass.style.borderColor = '#D90429';
            setTimeout(() => inputPass.style.borderColor = 'var(--glass-border)', 1000);
        }
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', doLogin);
    }
    if (inputPass) {
        inputPass.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') doLogin();
        });
    }
}

/**
 * 5. Micro-Haptic Feedback
 */
function initHaptics() {
    // Escuchar clicks globales y verificar si cayeron en elementos clickeables "Premium"
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a, button, .massive-card, .product-card');
        if (target) {
            triggerHapticFeedback();
        }
    });
}

function triggerHapticFeedback() {
    // Vibration API: 50ms pulse for a "tick" physical feeling
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

/**
 * 6. Cinematic Splash Screen
 */
function initSplashScreen() {
    const splash = document.getElementById('splash-screen');
    if (splash) {
        // Fallback for extremely fast load or dev mode
        if (window.ALFA_PAGE_MODE !== 'HOME') {
            splash.style.display = 'none';
            return;
        }

        setTimeout(() => {
            splash.classList.add('hidden');
            setTimeout(() => {
                splash.style.display = 'none'; // removing from DOM flow completely
            }, 800); // 800ms matches the CSS transition time
        }, 1500); // 1.5s splash duration
    }
}

/**
 * 7. Dynamic Parallax Effect
 */
function initParallax() {
    const massiveCards = document.querySelectorAll('.massive-card');
    if (massiveCards.length === 0) return;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        massiveCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            // Check if card is in viewport
            if (rect.top < windowHeight && rect.bottom > 0) {
                const bg = card.querySelector('.mc-bg');
                if (bg) {
                    // Parallax math: move the background slightly based on scroll position relative to the element
                    // The center of the element should ideally have 0 translation
                    const elemCenter = rect.top + rect.height / 2;
                    const viewCenter = windowHeight / 2;
                    const offset = (elemCenter - viewCenter) * -0.15; // -0.15 speed factor

                    bg.style.transform = `translateY(${offset}px) scale(1.05)`;
                    // scale 1.05 matches the hover scale roughly to avoid clipping and allow smooth transform
                }
            }
        });
    });
}

// Ensure init
document.addEventListener('DOMContentLoaded', () => {
    initSplashScreen();
    initAOS();
    initNavbar();
    initFAQ();
    initWhatsAppLinks();
    loadCatalogRouter();
    initAdminAuth();
    initHaptics();
    initParallax();
});
