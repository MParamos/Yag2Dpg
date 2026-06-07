/**
 * @file app.js
 * @description UI interaction and language state manager for Yag2Dpg.
 * @author Miguel Páramos
 */

// Export language globally so game.js can access it for the canvas rendering
window.activeLanguage = 'es';

/**
 * Applies the selected language to the DOM and updates the global state.
 * @param {string} lang - The language code to apply ('es', 'en', 'fr')
 */
function applyLanguage(lang) {
    window.activeLanguage = lang;
    
    // 1. Update flag UI states
    document.querySelectorAll('#langSelector .flag-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active', 'opacity-100');
            btn.classList.remove('opacity-50');
        } else {
            btn.classList.remove('active', 'opacity-100');
            btn.classList.add('opacity-50');
        }
    });

    // 2. Update URL silently
    window.history.replaceState(null, '', '?lang=' + lang);

    // 3. Update mailto link dynamically
    const mailLink = document.getElementById('enlace-bug');
    if (mailLink) {
        mailLink.href = `mailto:hola@mparamos.com?subject=${encodeURIComponent(getText(lang, 'bug_subject'))}`;
    }

    // 4. Translate static DOM elements (Footer)
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerHTML = getText(lang, key);
    });
}

// Initialization on load
window.addEventListener('DOMContentLoaded', () => {
    // Set dynamic current year
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) yearSpan.innerText = new Date().getFullYear();

    // Attach events to flags
    document.querySelectorAll('#langSelector .flag-btn').forEach(btn => {
        btn.addEventListener('click', () => applyLanguage(btn.getAttribute('data-lang')));
    });

    // Read URL params or default to Spanish
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    
    if (['es', 'en', 'fr'].includes(langParam)) {
        applyLanguage(langParam);
    } else {
        applyLanguage('es'); 
    }


    // 5. Footer Toggle Logic (Hide/Show via Tab)
    const footerToggleBtn = document.getElementById('footer-toggle');
    const footerContent = document.getElementById('footer-content');
    const toggleIcon = document.getElementById('toggle-icon');
    let isFooterVisible = true;

    if (footerToggleBtn && footerContent && toggleIcon) {
        footerToggleBtn.addEventListener('click', () => {
            isFooterVisible = !isFooterVisible;
            if (isFooterVisible) {
                // Show footer, arrow down
                footerContent.classList.remove('max-h-0', 'opacity-0');
                footerContent.classList.add('max-h-[500px]', 'opacity-100');
                toggleIcon.style.transform = 'rotate(0deg)';
            } else {
                // Hide footer, arrow up
                footerContent.classList.add('max-h-0', 'opacity-0');
                footerContent.classList.remove('max-h-[500px]', 'opacity-100');
                toggleIcon.style.transform = 'rotate(180deg)';
            }
        });
    }

    // 6. Canvas Dynamic Resizing Observer
    // Detects layout shifts (like the footer sliding) and smoothly updates q5play
    const gameContainer = document.getElementById('game-container');
    if (gameContainer && typeof windowResized === 'function') {
        const resizeObserver = new ResizeObserver(() => {
            windowResized(); // Force p5play to re-evaluate canvas dimensions
        });
        resizeObserver.observe(gameContainer);
    }

});