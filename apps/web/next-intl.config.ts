export const locales = ['en', 'es', 'fr', 'hi', 'ne'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

const config = {
  locales,
  defaultLocale,
};

export default config;
