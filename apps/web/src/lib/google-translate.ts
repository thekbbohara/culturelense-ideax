// Google Translate helper functions using cookies
export const changeLanguage = (languageCode: string) => {
    if (typeof window === 'undefined') return;

    // Cookie format required by Google Translate: /source/target
    const targetLang = languageCode === 'en' ? 'en' : languageCode;
    const cookieValue = `/en/${targetLang}`;

    // Check if the cookie is already set correctly
    const cookies = document.cookie.split('; ');
    const existingCookie = cookies.find(row => row.startsWith('googtrans='));
    
    // If we are already on the correct language, do nothing
    if (existingCookie && existingCookie.split('=')[1] === cookieValue) {
        return;
    }
    
    // If target is English and we have no cookie, we are good (assuming site is EN)
    // But if we are switching TO English from something else, we need to clear or set to /en/en
    if (targetLang === 'en' && !existingCookie) {
        return;
    }

    // Helper to set cookie
    const setCookie = (name: string, value: string, domain?: string) => {
        let cookie = `${name}=${value}; path=/`;
        if (domain) {
            cookie += `; domain=${domain}`;
        }
        document.cookie = cookie;
    };

    // Set the cookie
    setCookie('googtrans', cookieValue);
    setCookie('googtrans', cookieValue, window.location.hostname);
    
    // Also try setting on domain root if we are on a subdomain
    const domainParts = window.location.hostname.split('.');
    if (domainParts.length > 2) {
        const rootDomain = domainParts.slice(-2).join('.');
        setCookie('googtrans', cookieValue, `.${rootDomain}`);
    }

    // Reload to apply translation
    window.location.reload();
};

// Initialize on page load
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        const savedLang = localStorage.getItem('preferred_language');
        if (savedLang && savedLang !== 'en') {
             // Use our safe function which checks before reloading
             changeLanguage(savedLang);
        }
    });
}
