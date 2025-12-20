'use client';

import { useEffect, useRef } from 'react';

let scriptLoaded = false;

export function GoogleTranslateScript() {
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent multiple script loads and initializations
    if (hasInitialized.current || scriptLoaded) {
      return;
    }
    hasInitialized.current = true;

    // Check if script is already loaded
    const existingScript = document.querySelector(
      'script[src*="translate.google.com/translate_a/element.js"]',
    );
    if (existingScript) {
      scriptLoaded = true;
      return;
    }

    // Check if already initialized
    const translateElement = document.getElementById('google_translate_element');
    if (translateElement && translateElement.innerHTML.trim() !== '') {
      scriptLoaded = true;
      return;
    }

    // Define the initialization function globally (only once)
    // @ts-ignore
    if (!window.googleTranslateElementInit) {
      // @ts-ignore
      window.googleTranslateElementInit = () => {
        // Double-check the element isn't already populated
        const el = document.getElementById('google_translate_element');
        if (el && el.innerHTML.trim() !== '') {
          return;
        }
        // @ts-ignore
        if (window.google?.translate?.TranslateElement) {
          // @ts-ignore
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              layout:
                // @ts-ignore
                window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            },
            'google_translate_element',
          );
        }
      };
    }

    // Create and append the script
    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.type = 'text/javascript';
    script.async = true;
    document.body.appendChild(script);
    scriptLoaded = true;

    // No cleanup - we want the script to persist across navigations
  }, []);

  return null;
}
