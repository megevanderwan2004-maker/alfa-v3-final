// =========================================
// ALFA CAR AUDIO - Client Script
// =========================================

// Configuration
const CONFIG = {
    // Replace with your actual WhatsApp number including country code (e.g. 52 for Mexico)
    whatsappNumber: "5211234567890",
    whatsappDefaultMsg: "Hola, me interesa obtener más información sobre sus sistemas de audio premium."
};

/**
 * 1. AOS Initialization with Fallback Safety
 * Garanti Anti-écran Noir
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
            // Remove aos stylesheet to prevent it from hiding items later
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
                disable: 'mobile' // Optional: disables animations on mobile for better performance
            });
            aosInitialized = true;
            clearTimeout(fallbackTimeout);
        } else {
            console.error("AOS library not found.");
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

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                if (navLinks) navLinks.classList.remove('active'); // Close mobile menu if open

                const targetId = href.substring(1);
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    window.scrollTo({
                        top: targetEl.offsetTop - 80, // Offset for fixed navbar
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

/**
 * 3. Catalog Loading Logic
 * Uses exclusively staticCatalogData from catalog.js
 */
function loadCatalog() {
    const grid = document.getElementById('gallery-grid');
    const spinner = document.getElementById('loading-spinner');
    const emptyState = document.getElementById('empty-state');
    const filtersContainer = document.getElementById('filters-container');

    if (!grid || !spinner || !emptyState || !filtersContainer) return;

    // Simulate slight loading delay for premium feel
    setTimeout(() => {
        spinner.style.display = 'none';

        // Check if data exists
        if (typeof catalog === 'undefined' || !Array.isArray(catalog) || catalog.length === 0) {
            emptyState.style.display = 'block';
            console.warn("Catalog data is empty or not found in catalog.js");
            return;
        }

        const data = catalog;
        const sections = new Set();

        // Render all products initially
        renderProducts(data, grid);

        // Extract categories for filters
        data.forEach(item => {
            if (item.categoria) sections.add(item.categoria);
        });

        // Generate filter buttons
        sections.forEach(sec => {
            if (sec.trim() === '') return;
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.setAttribute('data-filter', sec);
            btn.textContent = sec; // user sections are already well formatted like "LED ALFA S2"
            filtersContainer.appendChild(btn);
        });

        // Initialize filter logic
        initFilters(data, grid);

    }, 800);
}

function renderProducts(products, container) {
    container.innerHTML = '';

    if (products.length === 0) {
        container.style.display = 'none';
        document.getElementById('empty-state').style.display = 'block';
        return;
    }

    container.style.display = 'grid';
    document.getElementById('empty-state').style.display = 'none';

    products.forEach((product, index) => {
        const delay = (index % 4) * 100; // Staggered animation delay

        // Ensure image source is handled properly
        const imgSrc = product.imagePath && product.imagePath.trim() !== ""
            ? product.imagePath
            : 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22400%22%20height%3D%22400%22%20fill%3D%22%23222%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20text-anchor%3D%22middle%22%20fill%3D%22%23666%22%20dy%3D%22.3em%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';

        const sectionLabel = product.categoria ? product.categoria : 'General';

        // Generate WhatsApp link specific to product
        const waMsg = encodeURIComponent(`Hola, me interesa el producto: ${product.nombre} (SKU: ${product.sku || 'N/A'}) del catálogo Alfa Car Audio.`);
        const waLink = `https://wa.me/${CONFIG.whatsappNumber}?text=${waMsg}`;

        // Format Price
        let priceDisplay = 'Consultar precio';
        if (product.precio && product.precio !== 0 && product.precio !== "0") {
            priceDisplay = `$${product.precio}`;
        }

        const cardHTML = `
            <div class="product-card" data-aos="fade-up" data-aos-delay="${delay}">
                <div class="product-image-container">
                    <img src="${imgSrc}" alt="${product.nombre}" class="product-image" loading="lazy">
                    ${product.isNew ? '<span class="product-badge">NUEVO</span>' : ''}
                </div>
                <div class="product-info">
                    <span class="product-category">${sectionLabel}</span>
                    <h3 class="product-name">${product.nombre}</h3>
                    <p class="product-desc" style="font-size: 0.85rem; color: #aaa; margin-bottom: 10px;">${product.description || ''}</p>
                    <div class="product-price">${priceDisplay}</div>
                    <a href="${waLink}" target="_blank" class="btn-product-wa">
                        <i class="fa-brands fa-whatsapp"></i> Lo quiero
                    </a>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

function initFilters(allData, gridContainer) {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Update active class
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filterValue = this.getAttribute('data-filter');

            // Filter data
            if (filterValue === 'all') {
                renderProducts(allData, gridContainer);
            } else {
                const filtered = allData.filter(item => item.categoria === filterValue);
                renderProducts(filtered, gridContainer);
            }

            // Bypass AOS for newly rendered items to prevent them from staying hidden
            document.querySelectorAll('#gallery-grid .product-card').forEach(el => {
                el.removeAttribute('data-aos');
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
        });
    });
}

/**
 * 4. General Utilities
 */
function formatCategoryName(str) {
    return str.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// formatPrice removed since price is already formatted exactly in the catalog

function initWhatsAppLinks() {
    const waParams = `?text=${encodeURIComponent(CONFIG.whatsappDefaultMsg)}`;
    const baseWaUrl = `https://wa.me/${CONFIG.whatsappNumber}${waParams}`;

    const floatWa = document.getElementById('floating-wa');
    const footerWa = document.getElementById('footer-wa-link');

    if (floatWa) floatWa.href = baseWaUrl;
    if (footerWa) footerWa.href = baseWaUrl;
}

/**
 * 5. Admin Authentication Logic
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
        inputPass.value = '';
        if (errorMsg) errorMsg.textContent = '';
        setTimeout(() => inputPass.focus(), 100);
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
            // Save temporary auth token in sessionStorage
            sessionStorage.setItem('alfa_admin_auth', 'true');
            window.location.href = 'admin.html';
        } else {
            if (errorMsg) errorMsg.textContent = 'Contraseña incorrecta';
            inputPass.style.borderColor = '#ff4d4d';
            setTimeout(() => inputPass.style.borderColor = '', 1000);
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

// =========================================
// Initialization
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    initAOS();
    initNavbar();
    initWhatsAppLinks();
    loadCatalog();
    initAdminAuth();
});
