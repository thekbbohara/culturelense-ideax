// Google Translate helper functions
export const changeLanguage = (languageCode: string) => {
    if (typeof window === 'undefined') return;

    // Language code mapping for Google Translate
    const langMap: Record<string, string> = {
        'en': 'en',
        'es': 'es',
        'fr': 'fr',
        'hi': 'hi',
        'ne': 'ne'
    };

    const targetLang = langMap[languageCode] || 'en';

    // Get the Google Translate select element
    const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;

    if (selectElement) {
        selectElement.value = targetLang;
        selectElement.dispatchEvent(new Event('change'));
    } else {
        // If widget not loaded yet, try again after a short delay
        setTimeout(() => {
            const retrySelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
            if (retrySelect) {
                retrySelect.value = targetLang;
                retrySelect.dispatchEvent(new Event('change'));
            }
        }, 1000);
    }
};

// Initialize on page load
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        // Auto-trigger saved language preference
        const savedLang = localStorage.getItem('preferred_language');
        if (savedLang && savedLang !== 'en') {
            setTimeout(() => changeLanguage(savedLang), 2000);
        }
    });
}
