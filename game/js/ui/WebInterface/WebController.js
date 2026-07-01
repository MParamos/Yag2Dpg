/**
 * @file WebController.js
 * @description Manages DOM-level interaction, such as responsive canvas 
 * resizing, external UI (like language selectors), and CSS transitions 
 * that are outside the scope of the p5.js canvas.
 * @author Miguel Páramos
 */
class WebController {
    #isFooterVisible;

    constructor() {
        this.#isFooterVisible = true;
        this.#initLanguage();
        this.#initFooter();
        this.#initResizeObserver();
    }

    #initLanguage() {
        const urlParams = new URLSearchParams(window.location.search);
        const langParam = urlParams.get('lang');

        let lang = langParam;

        if (!lang) {
            lang = localStorage.getItem('user_lang') || 'es';
        }

        I18n.activeLang = lang;
        localStorage.setItem('user_lang', lang);

        document.querySelectorAll('.flag-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            }

            btn.addEventListener('click', (e) => {
                const selectedLang = e.target.getAttribute('data-lang');
                
                // Keep the ?zip= parameter if it exists when changing language
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('lang', selectedLang);
                
                window.location.href = currentUrl.toString();
            });
        });

        window.history.replaceState(null, '', '?lang=' + lang);

        const mailLink = document.getElementById('enlace-bug');
        if (mailLink) {
            mailLink.href = `mailto:hola@mparamos.com?subject=${encodeURIComponent(I18n.getText('bug_subject'))}`;
        }

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.innerHTML = I18n.getText(key);
        });
    }

    #initFooter() {
        const footerToggleBtn = document.getElementById('footer-toggle');
        const footerContent = document.getElementById('footer-content');
        const toggleIcon = document.getElementById('toggle-icon');

        if (footerToggleBtn && footerContent && toggleIcon) {
            footerToggleBtn.addEventListener('click', () => {
                this.#isFooterVisible = !this.#isFooterVisible;
                if (this.#isFooterVisible) {
                    footerContent.classList.remove('max-h-0', 'opacity-0');
                    footerContent.classList.add('max-h-[500px]', 'opacity-100');
                    toggleIcon.style.transform = 'rotate(0deg)';
                } else {
                    footerContent.classList.add('max-h-0', 'opacity-0');
                    footerContent.classList.remove('max-h-[500px]', 'opacity-100');
                    toggleIcon.style.transform = 'rotate(180deg)';
                }
            });
        }
    }

    #initResizeObserver() {
        const gameContainer = document.getElementById('game-container');
        if (gameContainer && typeof windowResized === 'function') {
            const resizeObserver = new ResizeObserver(() => {
                windowResized();
            });
            resizeObserver.observe(gameContainer);
        }
    }
}

// Inicialización limpia al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    new WebController();
});
