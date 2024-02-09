/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

import {
  type ParsedMessage,
  parseText,
  type PluralPart,
  type TransformParameterPart,
} from './parser.ts';

/**
 * Cache of resolved messages. Stores the data in the following format:
 *
 * ```ts
 * type Cache = {
 *   'en-US': {
 *     'Hello World Key': ParsedMessagePart,
 *   };
 * };
 * ```
 */
let cache: Record<string, Record<string, ParsedMessage>> = {};

/**
 * Cache of translations. Stores the data in the following format:
 *
 * ```ts
 * type Translations = {
 *   'Hello World Key': (args: Record<string, unknown>) => string,
 * };
 * ```
 */
let translations: Record<string, (args?: Record<string, unknown>) => string> = {};

/**
 * The `i18n` function is the main function of the library. It returns a factory function that
 * can be used to create translations for the given locale.
 *
 * It also has a `clear` function that clears the cache and translations objects.
 */
export const i18n: I18n = Object.assign(i18nImpl, {
  clear: clearTranslation,
}) as I18n;

/**
 * The `i18nImpl` function is the main function of the library. It returns a factory function that
 * can be used to create translations for the given locale.
 */
function i18nImpl(options: I18nOptions) {
  /**
   * The `createTranslations` function creates a cached translations object for the given locale and
   * each key is a function that returns the translated message with the given arguments.
   */
  const createTranslations = (locale: string) => {
    const pluralRules = new Intl.PluralRules(locale);

    const availableLocales = Object.keys(cache);
    const localeForKeys = availableLocales.at(0);

    if (!localeForKeys) {
      throw new Error(
        'Before creating translations, you must load a translation resource with the loadTranslation function',
      );
    }

    const resourceKeys = Object.keys(cache[localeForKeys]);

    resourceKeys.forEach((key) => {
      const message = getMessage(locale, key, cache);

      translations[key] = (args?: Record<string, unknown>) =>
        message
          .map((part) => {
            if (part.kind === 'text') {
              return part.content;
            }

            const value = args?.[part.key];

            if (part.kind === 'plural') {
              const plural = getPlural(pluralRules, part, value);
              // Replace ?? with the value.
              const pluralInjected = plural.replace(/\?\?/g, value as string);
              return pluralInjected;
            }

            const formattedValue = part.transforms.length
              ? applyFormatters(options.formatters, part.transforms, value)
              : value as string;

            return ('' + (formattedValue ?? '')).trim();
          })
          .join('');
    });

    return translations;
  };

  /**
   * The `loadTranslation` function loads a translation resource into the cache object. Then with
   * the `createTranslations` function we can create a cached translations object for the given
   * locale. without having to load the translation resource again.
   */
  const loadTranslation = (resource: I18nResource) => {
    const { locale, translations } = resource;

    Object.entries(translations).forEach(([key, value]) => {
      // Store in cache if not already stored.
      if (!cache[locale]) {
        cache[locale] = {};
      }

      if (!cache[locale][key]) {
        cache[locale][key] = parseText(value);
      }
    });
  };

  const i18nFactory = Object.assign(createTranslations, {
    load: loadTranslation,
  });
  return i18nFactory;
}

/**
 * The `clearTranslation` function clears the cache and translations objects.
 *
 * This is useful for testing purposes.
 */
function clearTranslation() {
  cache = {};
  translations = {};
}

/**
 * The `applyFormatters` function applies the given formatters to the given value.
 */
const applyFormatters = (
  formatters: Record<string, I18nFormatter>,
  formatterKeys: TransformParameterPart[],
  initialValue: unknown,
): unknown => {
  let value = initialValue;

  formatterKeys.forEach((formatterKey) => {
    // Formatter
    if (formatterKey.kind === 'formatter') {
      const format = formatters[formatterKey.name];

      if (!format) {
        throw new Error(`Formatter "${formatterKey.name}" not found`);
      }

      value = format(value);
      return;
    }

    // Switch case
    const valueCase = formatterKey.cases.find((switchCase) => switchCase.key === value);

    if (valueCase) {
      value = valueCase.value;
      return;
    }

    const defaultCase = formatterKey.cases.find((switchCase) => switchCase.key === '*');
    value = defaultCase?.value ?? '';
  });

  return value;
};

/**
 * The `getPlural` function returns the plural part for the given value.
 */
const getPlural = (pluralRules: Intl.PluralRules, part: PluralPart, value: unknown): string => {
  switch (part.zero && value === 0 ? 'zero' : pluralRules.select(value as number)) {
    case 'zero':
      return part.zero ?? '';
    case 'one':
      return part.one ?? '';
    case 'two':
      return part.two ?? '';
    case 'few':
      return part.few ?? part.other;
    case 'many':
      return part.many ?? part.other;
    default:
      return part.other;
  }
};

/**
 * The `getMessage` function returns the message to parse for the given locale and key.
 */
const getMessage = (
  locale: string,
  key: string,
  translations: Record<string, Record<string, ParsedMessage>>,
): ParsedMessage => {
  const targetLocale = new Intl.Locale(locale);

  // Attempt to find the key in the specified locale.
  if (translations[targetLocale.baseName] && translations[targetLocale.baseName][key]) {
    return translations[targetLocale.baseName][key];
  }

  const translationsKeys = Object.keys(translations);

  // Find the closest match by language tag.
  const closestMatch = translationsKeys.find((availableLocale) => {
    const available = new Intl.Locale(availableLocale);
    return targetLocale.language === available.language;
  });

  // If a closest match is found, attempt to get the key from there.
  if (closestMatch && translations[closestMatch][key]) {
    return translations[closestMatch][key];
  }

  // Default to the first locale in the translations object.
  const defaultLocale = translationsKeys[0];
  return translations[defaultLocale][key] ?? '';
};

/**
 * The `I18nResource` type is the resource that can be loaded into the `i18n` function.
 */
export type I18nResource = {
  locale: string;
  translations: Record<string, string>;
};

/**
 * The `I18nFormatter` type is a function that receives a value and returns a string.
 */
export type I18nFormatter = (value: unknown) => string;

/**
 * The `I18nOptions` type is the options that can be passed to the `i18n` function.
 */
export type I18nOptions = {
  /**
   * The `formatters` object contains the formatters that can be used in the translations.
   */
  formatters: Record<string, I18nFormatter>;
};

type I18n =
  & { clear: () => void }
  & (<T extends Record<string, string>>(options: I18nOptions) =>
    & { load: (resource: I18nResource) => void }
    & ((locale: string) => {
      [K in keyof T]: (args?: Record<string, unknown>) => T[K];
    }));
