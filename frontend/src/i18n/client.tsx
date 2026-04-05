'use client';

/**
 * Client Components — import `I18nProvider` in root layout and use `useTranslation('common')`.
 */
import i18next from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import type { ReactNode } from 'react';
import commonEn from '../../public/locales/en/common.json';
import { defaultLocale } from './settings';

if (!i18next.isInitialized) {
  void i18next.use(initReactI18next).init({
    lng: defaultLocale,
    fallbackLng: defaultLocale,
    resources: { [defaultLocale]: { common: commonEn } },
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
  });
}

export function I18nProvider({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
}

export { useTranslation } from 'react-i18next';
export { i18next as i18nClient };
