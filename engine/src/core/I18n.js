/**
 * @file I18n.js
 * @description Static class handling internationalization and language state.
 */
export class I18n {
    static #activeLanguage = 'es';
    static #dictionary = {};

    static async init(configUrl = 'i18n.json') {
        try {
            const response = await fetch(configUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            this.#dictionary = await response.json();
            
            // Set initial language from URL or local storage if desired
            const urlParams = new URLSearchParams(window.location.search);
            const langParam = urlParams.get('lang');
            const storedLang = localStorage.getItem('user_lang');
            
            if (langParam && ['es', 'en', 'fr'].includes(langParam)) {
                this.#activeLanguage = langParam;
                localStorage.setItem('user_lang', langParam);
            } else if (storedLang && ['es', 'en', 'fr'].includes(storedLang)) {
                this.#activeLanguage = storedLang;
            }
        } catch (error) {
            console.error("Error loading i18n configuration:", error);
        }
    }

    static get activeLang() {
        return this.#activeLanguage;
    }

    static set activeLang(langCode) {
        if (['es', 'en', 'fr'].includes(langCode)) {
            this.#activeLanguage = langCode;
        }
    }

    static getText(key) {
        if (!this.#dictionary[this.#activeLanguage]) return key;
        return this.#dictionary[this.#activeLanguage][key] || this.#dictionary['es']?.[key] || key;
    }
}
