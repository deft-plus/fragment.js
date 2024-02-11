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

/**
 * The `I18n` type is the type of the `i18n` function.
 */
type I18n =
  & { clear: () => void }
  & (<T extends Record<string, string>>(options: I18nOptions) =>
    & { load: (resource: I18nResource) => void }
    & ((locale: string) => {
      [K in keyof T]: keyof Prettify<GetParams<T[K]>> extends never
        // No params
        ? () => string
        // Params
        : (args: Prettify<GetParams<T[K]>>) => string;
    }));

/**
 * The `GetParams` type maps the params from the path to the type.
 */
type GetParams<T extends string> = Trim<T> extends `{${infer Param}:${infer Type}}${infer Rest}`
  // Plural
  ? Param extends `{${infer Plural}` ? { [K in Plural]: number } & GetParams<Rest>
    // Switch case
  : Param extends `${infer SwitchParam}|{${infer _SwitchCases}`
    ? { [K in SwitchParam]: string } & GetParams<Rest>
    // Param
  : Type extends `${infer TypeWithF}|${infer _Formatters}`
    // Param with formatter
    ? Param extends `${infer ParamOp}?`
      // Param with formatter and optional
      ? { [K in ParamOp]?: StringToType<TypeWithF> } & GetParams<Rest>
      // Param with formatter and required
    : { [K in Param]: StringToType<TypeWithF> } & GetParams<Rest>
    // Param without formatter
  : Param extends `${infer ParamOp}?`
    // Param without formatter and optional
    ? { [K in ParamOp]?: StringToType<Type> } & GetParams<Rest>
    // Param without formatter and required
  : { [K in Param]: StringToType<Type> } & GetParams<Rest>
  // Check for more params
  : Trim<T> extends `${infer _Start}${infer Rest}` ? GetParams<Rest>
  // deno-lint-ignore ban-types
  : {};

/**
 * The `StringToType` type maps a string to a type.
 */
type StringToType<T extends string> = T extends keyof TypeMapping ? TypeMapping[T] : never;

/**
 * Interface with the mapping of string to type.
 */
type TypeMapping = {
  string: string;
  number: number;
  boolean: boolean;
};

/**
 * The `Trim` type trims the spaces from the given string.
 */
type Trim<T extends string, Acc extends string = ''> = T extends `${infer Char}${infer Rest}`
  // Remove spaces
  ? (Char extends ' ' ? Trim<Rest, Acc> : Trim<Rest, `${Acc}${Char}`>)
  // Return the accumulated string
  : (T extends '' ? Acc : never);

/**
 * The `Prettify` type prettifies the given object.
 */
// deno-lint-ignore ban-types
type Prettify<T> = { [K in keyof T]: T[K] } & {};
