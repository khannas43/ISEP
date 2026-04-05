/**
 * Server Components / RSC — use `getServerTranslations` then `t('key')`.
 * Async-capable; reads locale JSON from `public/locales`.
 */
import { createInstance, type i18n as I18nInstance, type TFunction } from 'i18next';
import fs from 'fs';
import path from 'path';
import { defaultLocale, type Locale } from './settings';

function loadCommonJson(locale: string): Record<string, unknown> {
  const filePath = path.join(process.cwd(), 'public', 'locales', locale, 'common.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw) as Record<string, unknown>;
}

export async function getServerTranslations(locale: Locale = defaultLocale): Promise<{
  t: TFunction<'common', undefined>;
  i18n: I18nInstance;
}> {
  const i18n = createInstance();
  const common = loadCommonJson(locale);
  await i18n.init({
    lng: locale,
    fallbackLng: defaultLocale,
    resources: { [locale]: { common } },
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
  });
  return { t: i18n.getFixedT(locale, 'common'), i18n };
}
