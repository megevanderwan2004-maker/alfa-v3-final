import os

css = """
/* Mobile Secondary Categories Ribbon */
.mobile-category-ribbon {
    display: none;
}
@media (max-width: 768px) {
    .mobile-category-ribbon {
        display: flex;
        width: 100%;
        overflow-x: auto;
        background: var(--bg-dark);
        border-top: 1px solid rgba(255,255,255,0.05);
        border-bottom: 1px solid rgba(255,255,255,0.05);
        padding: 0 10px;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
    }
    .mobile-category-ribbon::-webkit-scrollbar {
        display: none;
    }
    
    .ribbon-item {
        position: relative;
        padding: 12px 15px;
        color: var(--text-secondary);
        font-family: var(--font-heading);
        font-size: 0.85rem;
        white-space: nowrap;
        cursor: pointer;
    }
    .ribbon-item.active {
        color: var(--primary-color);
        /* border-bottom is simulated to ensure tight fit */
        box-shadow: inset 0 -2px 0 var(--primary-color);
    }
    
    .ribbon-dropdown {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        background: #0a0a0a;
        width: 220px;
        z-index: 9999; /* Absolute top priority */
        box-shadow: 0 10px 25px rgba(0,0,0,0.8);
        border: 1px solid rgba(255,255,255,0.1);
        border-top: none;
        border-radius: 0 0 5px 5px;
    }
    .ribbon-item.active .ribbon-dropdown {
        display: block;
    }
    .ribbon-dropdown a {
        display: block;
        padding: 14px 20px;
        color: #fff;
        text-decoration: none;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        font-size: 0.85rem;
        font-family: var(--font-body);
    }
    .ribbon-dropdown a:last-child {
        border-bottom: none;
    }
}
"""

with open('style.css', 'a', encoding='utf-8') as f:
    f.write(css)
print("CSS appended.")
