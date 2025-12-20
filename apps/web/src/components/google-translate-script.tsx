"use client";

import { useEffect } from "react";

export function GoogleTranslateScript() {
  useEffect(() => {
    // Define the initialization function globally
    // @ts-ignore
    window.googleTranslateElementInit = () => {
      // @ts-ignore
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          layout:
            // @ts-ignore
            window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    // Create and append the script
    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.type = "text/javascript";
    script.async = true;
    document.body.appendChild(script);

    // Cleanup: remove script and global function on unmount
    return () => {
      document.body.removeChild(script);
      // @ts-ignore
      delete window.googleTranslateElementInit;
    };
  }, []);

  return null;
}
