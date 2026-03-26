import os

js_code = """
// Toggle logic for the mobile category ribbon
function toggleRibbon(el, cat) {
    const parentItem = el.closest('.ribbon-item');
    if (!parentItem) return;
    const isActive = parentItem.classList.contains('active');
    
    // Close all
    document.querySelectorAll('.ribbon-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Toggle active state
    if (!isActive) {
        parentItem.classList.add('active');
    }
}

// Close ribbon dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.mobile-category-ribbon')) {
        document.querySelectorAll('.ribbon-item').forEach(item => item.classList.remove('active'));
    }
});
"""

with open('script.js', 'a', encoding='utf-8') as f:
    f.write(js_code)
print("JS appended.")
