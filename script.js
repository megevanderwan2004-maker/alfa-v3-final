// =========================================
// ALFA CAR AUDIO - Haute Couture Script
// =========================================

const CONFIG = {
    whatsappNumber: "5211234567890",
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
 * 2. Navigation Utilities
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
    // Audio acts as the fallback for everything else
};

function getMainMenuForCategory(catName) {
    const uCat = catName.toUpperCase();
    for (const [main, keywords] of Object.entries(categoryMap)) {
        if (keywords.some(kw => uCat.includes(kw))) return main;
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
    // If we're not on Home, redirect to Home with params to activate SPA
    if (window.ALFA_PAGE_MODE !== 'HOME') {
        window.location.href = `index.html?${type}=${encodeURIComponent(value)}`;
        return;
    }

    // SPA Mode (on index.html)
    const hero = document.getElementById('hero-section');
    const featured = document.getElementById('featured-products');
    const catalogSection = document.getElementById('catalog-section');
    const grid = document.getElementById('gallery-grid');
    const catalogTitle = document.getElementById('catalog-title');

    // Hide Home specific sections
    if (hero) hero.style.display = 'none';
    if (featured) featured.style.display = 'none';

    // Show Catalog
    if (catalogSection) {
        catalogSection.style.display = 'block';
        window.scrollTo({ top: catalogSection.offsetTop - 100, behavior: 'smooth' });
    }

    if (!catalog || !Array.isArray(catalog)) return;

    // Remove any AOS classes slightly safely to avoid layout jumps
    if (grid) grid.innerHTML = '';

    // Filter Logic
    if (type === 'search') {
        const lowerTerm = value.toLowerCase();
        const filtered = catalog.filter(item =>
            (item.nombre && item.nombre.toLowerCase().includes(lowerTerm)) ||
            (item.sku && item.sku.toLowerCase().includes(lowerTerm)) ||
            (item.categoria && item.categoria.toLowerCase().includes(lowerTerm))
        );
        if (catalogTitle) catalogTitle.textContent = `BÚSQUEDA: "${value.toUpperCase()}"`;
        renderProducts(filtered, grid);
    } else if (type === 'category') {
        const filtered = catalog.filter(item =>
            item.categoria && item.categoria.toLowerCase() === value.toLowerCase()
        );
        if (catalogTitle) catalogTitle.textContent = value.toUpperCase();
        renderProducts(filtered, grid);
    } else if (type === 'mainCategory') {
        const keywords = categoryMap[value] || [];
        const filtered = catalog.filter(item => {
            const uCat = (item.categoria || '').toUpperCase();
            return keywords.some(kw => uCat.includes(kw));
        });
        if (catalogTitle) catalogTitle.textContent = value.toUpperCase();
        renderProducts(filtered, grid);
    } else if (type === 'all') {
        if (catalogTitle) catalogTitle.textContent = 'COLECCIÓN COMPLETA';
        renderProducts(catalog, grid);
    }
}

/**
 * 3. Catalog Loading Router
 */
function loadCatalogRouter() {
    const mode = window.ALFA_PAGE_MODE || 'HOME';
    console.log("Loading Mode: ", mode);

    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        setTimeout(() => spinner.style.display = 'none', 800);
    }

    setTimeout(() => {
        if (typeof catalog === 'undefined' || !Array.isArray(catalog) || catalog.length === 0) {
            const emptyState = document.getElementById('empty-state');
            if (emptyState) emptyState.style.display = 'block';
            console.warn("Catalog data is empty or not found in catalog.js");
            return;
        }

        if (mode === 'HOME') {
            loadHome(catalog);
        } else if (mode === 'TIENDA') {
            loadTienda(catalog);
        } else if (mode === 'PRODUCT') {
            loadProductDetails(catalog);
        }
    }, 800);
}

// ---- HOME VIEW ----
function loadHome(data) {
    const grid = document.getElementById('featured-grid');
    if (grid) {
        // Sélection de 3 produits "Destacados" fixes par SKU
        // Remplacer ces SKUs par les vrais choisis depuis le catalogue
        const targetSkus = ['#KFOLEALM1H4', '#KFOLEALM1H13', '#KFOLEALM1H7'];

        const destacados = data.filter(item => targetSkus.includes(String(item.sku)));

        // Si les SKUs temporaires ne sont pas trouvés, fallback de sécurité sur les 3 premiers
        if (destacados.length === 0) {
            renderProducts(data.slice(0, 3), grid, true);
        } else {
            renderProducts(destacados.slice(0, 3), grid, true);
        }
    }

    initMegaMenu(data);

    // Initial SPA State Check based on URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get('category')) {
        handleSpaNavigation(params.get('category'), 'category');
    } else if (params.get('search')) {
        handleSpaNavigation(params.get('search'), 'search');
    } else if (params.get('all')) {
        handleSpaNavigation('all', 'all');
    }
}

// ---- TIENDA VIEW ----
function loadTienda(data) {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    // Inicialiser la Búsqueda et les Catégories
    initSearch(data, grid);
    initDynamicCategories(data, grid);

    // See if we have a filter parameter from clicking navbar on another page
    const params = new URLSearchParams(window.location.search);
    const filterParam = params.get('filter');
    const searchParam = params.get('q');

    if (searchParam) {
        const searchInput = document.getElementById('header-search-input');
        if (searchInput) searchInput.value = searchParam;

        const filtered = data.filter(item =>
            (item.nombre && item.nombre.toLowerCase().includes(searchParam.toLowerCase())) ||
            (item.sku && item.sku.toLowerCase().includes(searchParam.toLowerCase())) ||
            (item.categoria && item.categoria.toLowerCase().includes(searchParam.toLowerCase()))
        );
        const catalogTitle = document.getElementById('catalog-title');
        if (catalogTitle) catalogTitle.textContent = `BÚSQUEDA: "${searchParam.toUpperCase()}"`;
        renderProducts(filtered, grid);
    } else if (filterParam) { // Deprecated but kept for safety if Home Massive cards are used
        const filtered = data.filter(item =>
            item.categoria && item.categoria.toLowerCase().includes(filterParam.toLowerCase())
        );
        const catalogTitle = document.getElementById('catalog-title');
        if (catalogTitle) catalogTitle.textContent = filterParam.toUpperCase();
        renderProducts(filtered, grid);
    } else {
        // En tienda normal, afficher tout par défaut
        renderProducts(data, grid);
    }
}

// ---- PRODUCT VIEW ----
function loadProductDetails(data) {
    const params = new URLSearchParams(window.location.search);
    const sku = params.get('sku');

    const containerEl = document.getElementById('single-product-container');
    const errorEl = document.getElementById('error-state');

    if (!sku) {
        if (errorEl) errorEl.style.display = 'block';
        return;
    }

    // Recherche blindée
    const decodedSku = decodeURIComponent(sku).trim().toLowerCase();
    const product = data.find(p => String(p.sku).trim().toLowerCase() === decodedSku);

    console.log("SKU cherché:", decodedSku, "Produit trouvé:", product);

    if (!product) {
        if (errorEl) errorEl.style.display = 'block';
        return;
    }

    if (containerEl) {
        containerEl.style.display = 'flex'; // show the layout

        const imgSrc = product.imagePath && product.imagePath.trim() !== "" ? product.imagePath : '';
        document.getElementById('sp-img').src = imgSrc;

        document.getElementById('sp-title').textContent = product.nombre || 'Producto';
        document.getElementById('sp-category').textContent = product.categoria || 'GENERAL';
        document.getElementById('sp-sku-val').textContent = product.sku || 'N/A';

        let priceDisplay = '0.00';
        let prefixDisplay = '';
        if (product.precio && product.precio !== 0 && product.precio !== "0") {
            priceDisplay = product.precio;
            prefixDisplay = '<span>$</span>'; // custom styling prefix as defined in style.css
        } else {
            priceDisplay = 'Consultar precio';
        }
        document.getElementById('sp-price').innerHTML = prefixDisplay + priceDisplay;

        // Update Sticky CTA Price
        const mscPrice = document.getElementById('msc-price');
        if (mscPrice) mscPrice.innerHTML = prefixDisplay + priceDisplay;

        const defaultDesc = 'Bienvenido al máximo nivel de ALFA Audio. Este componente ha sido fabricado con estándares automotrices de clase mundial, diseñado para ofrecer una estética perfecta y un rendimiento acústico insuperable. Dale a tu vehículo la identidad que merece.';
        document.getElementById('sp-desc-val').textContent = product.description || defaultDesc;

        // WA Link
        const waMsg = encodeURIComponent(`Hola, quisiera ordenar este producto exclusivo: ${product.nombre} (SKU: ${product.sku || 'N/A'}) del Catálogo ALFA.`);
        const waLink = `https://wa.me/${CONFIG.whatsappNumber}?text=${waMsg}`;

        const spWaBtn = document.getElementById('sp-wa-btn');
        if (spWaBtn) {
            spWaBtn.href = waLink;
            spWaBtn.innerHTML = '<i class="fa-brands fa-whatsapp"></i> COMPRAR POR WHATSAPP';
        }

        const mscWaBtn = document.getElementById('msc-wa-btn');
        if (mscWaBtn) {
            mscWaBtn.href = waLink;
            mscWaBtn.innerHTML = '<i class="fa-brands fa-whatsapp"></i> COMPRAR POR WHATSAPP';
        }

        // Venta Cruzada (Related Products)
        const relatedSection = document.getElementById('related-products-section');
        const relatedGrid = document.getElementById('related-grid');
        if (relatedSection && relatedGrid && product.categoria) {
            // Filter by same category, exclude current product
            const related = data.filter(p =>
                p.categoria &&
                p.categoria.toLowerCase() === product.categoria.toLowerCase() &&
                p.sku !== product.sku
            );

            if (related.length > 0) {
                // Shuffle and pick 3
                const shuffled = [...related].sort(() => 0.5 - Math.random());
                const top3 = shuffled.slice(0, 3);

                renderProducts(top3, relatedGrid);
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
                <img src="${imgSrc}" alt="${product.nombre}" class="product-img" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
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

function initSearch(allData, gridContainer) {
    const searchInput = document.getElementById('header-search-input');

    if (!searchInput) return;

    searchInput.addEventListener('keyup', (e) => {
        const term = e.target.value.trim();
        if (e.key === 'Enter' && term.length > 0) {
            handleSpaNavigation(term, 'search');
        }
    });

    // Extra: If user types while in tienda, we could still do real-time filtering, but strictly we SPA navigate stringently on Enter.
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
