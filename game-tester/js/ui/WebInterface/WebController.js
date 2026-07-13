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
        window.webController = this;
        this.#initLanguage();
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
                
                // Update URL parameter silently
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('lang', selectedLang);
                window.history.replaceState(null, '', currentUrl.toString());

                // Update internal state and storage
                I18n.activeLang = selectedLang;
                localStorage.setItem('user_lang', selectedLang);

                // Update active flag UI
                document.querySelectorAll('.flag-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update basic DOM texts
                document.querySelectorAll('[data-i18n]').forEach(el => {
                    const key = el.getAttribute('data-i18n');
                    el.innerHTML = I18n.getText(key);
                });

                // Update email link
                const mailLink = document.getElementById('enlace-bug');
                if (mailLink) {
                    mailLink.href = `mailto:hola@mparamos.com?subject=${encodeURIComponent(I18n.getText('bug_subject'))}`;
                }

                // Notify Phaser game
                if (window.game) {
                    window.game.events.emit('language-changed');
                }
            });
        });

        urlParams.set('lang', lang);
        window.history.replaceState(null, '', '?' + urlParams.toString());

        const mailLink = document.getElementById('enlace-bug');
        if (mailLink) {
            mailLink.href = `mailto:hola@mparamos.com?subject=${encodeURIComponent(I18n.getText('bug_subject'))}`;
        }

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.innerHTML = I18n.getText(key);
        });
    }

    setFooterVisibility(visible) {
        this.#isFooterVisible = visible;
        const appFooter = document.getElementById('app-footer');
        if (appFooter) {
            if (visible) {
                appFooter.style.display = 'block';
            } else {
                appFooter.style.display = 'none';
            }
            
            // Force Phaser resize immediately without waiting for ResizeObserver
            if (window.game && window.game.scale) {
                // Let the browser apply the display:none first, then update size
                setTimeout(() => {
                    if (window.game && window.game.scale) {
                        window.game.scale.refresh();
                    }
                }, 10);
            }
        }
    }

    #initResizeObserver() {
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            let resizeTimeout;
            const resizeObserver = new ResizeObserver((entries) => {
                if (resizeTimeout) clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    if (window.game && window.game.scale) {
                        window.game.scale.refresh();
                    }
                }, 100);
            });
            resizeObserver.observe(gameContainer);
        }
    }
}

// Inicialización limpia al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    new WebController();
});
