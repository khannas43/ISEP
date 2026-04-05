/** Default locale until App Router `[lng]` routing is introduced (ISEP i18n clarification). */
export const defaultLocale = 'en' as const;
export const locales = ['en'] as const;
export type Locale = (typeof locales)[number];
