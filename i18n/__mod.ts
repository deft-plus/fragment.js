import { type PluralizationResolver, pluralizationResolver } from './__pluralization_resolver.ts';
import { defaultFormatters } from './__formatter.ts';

/** Internal symbol to mark the object with metadata. */
const i18nKey = Symbol('__internal_i18n_meta__');

/** Config to create a translation. */
export interface I18nConfig<
  TLanguages extends string[] = ['en'],
  TFormatters extends Record<PropertyKey, unknown> = typeof defaultFormatters,
> {
  languages?: [...TLanguages];
  defaultLanguage?: TLanguages[number];
  formatters?: TFormatters;
  pluralizationResolver?: PluralizationResolver;
}

/**
 * Internalization API to create translations.
 */
export function i18n<
  const TLanguages extends string[] = ['en'],
  TFormatters extends Record<PropertyKey, unknown> = typeof defaultFormatters,
>(config?: I18nConfig<TLanguages, TFormatters>) {
  return new I18n(config);
}

/** I18n Implementation to create and merge translations. */
class I18n<
  TLanguages extends string[] = ['en'],
  TFormatters extends Record<PropertyKey, unknown> = typeof defaultFormatters,
> {
  constructor(config?: I18nConfig<TLanguages, TFormatters>) {
    this.#config = {
      languages: ['en'] as TLanguages,
      defaultLanguage: config?.languages?.[0] ?? 'en',
      formatters: defaultFormatters as unknown as TFormatters,
      pluralizationResolver: pluralizationResolver.english,
      ...config,
    };
  }

  /** Private config to store the languages and formatters with the default values. */
  #config: Required<I18nConfig<TLanguages, TFormatters>>;

  /**
   * Creates a new translation namespace.
   */
  public create<TNamespace extends string, TTranslations extends Translations<TLanguages>>(
    options: {
      namespace: TNamespace;
      resources: (formatters: TFormatters) => TTranslations;
    },
  ) {
    const { namespace, resources } = options;
    const { formatters, languages: globalLanguages, defaultLanguage } = this.#config;

    const rawTranslations = resources(formatters);

    this.#validateLanguages(namespace, rawTranslations);

    /** Function to configure a global config to use the translations. */
    const useTranslation = (options?: UseTranslationOptions<TLanguages>) => {
      const optionsWithDefaults = {
        lang: defaultLanguage ?? globalLanguages[0],
        ...options,
      };
      const globalLang = optionsWithDefaults.lang;

      // Object with all the translations to create.
      const translations = Object.entries(rawTranslations).reduce((output, [key, fn]) => ({
        ...output,
        [key]: this.#resolveTranslation({ fn, globalLang, key, allLanguages: globalLanguages }),
      }), {});

      return translations as ReturnTranslations<TLanguages, TTranslations>;
    };

    return Object.assign(useTranslation, {
      [i18nKey]: {
        namespace,
        translations: rawTranslations,
      },
    });
  }

  /**
   * Merges the given translations with its own namespace.
   */
  public merge<TTranslations extends InternalI18n<TLanguages>[]>(translations: [...TTranslations]) {
    const { languages: globalLanguages, defaultLanguage } = this.#config;

    const useTranslation = <
      TNamespace extends AllNamespaces<TLanguages, TTranslations> | undefined = undefined,
    >(
      options?: UseTranslationOptionsMerge<TLanguages, TNamespace>,
    ) => {
      const { lang, namespace } = {
        lang: defaultLanguage ?? globalLanguages[0],
        namespace: undefined,
        ...options,
      };

      const allTranslations = () =>
        translations.reduce((output, record) => {
          const { namespace, translations } = record[i18nKey];

          return {
            ...output,
            ...Object.entries(translations).reduce((innerOutput, [key, fn]) => ({
              ...innerOutput,
              [`${namespace}.${key}`]: this.#resolveTranslation({
                fn,
                globalLang: lang,
                key,
                allLanguages: globalLanguages,
              }),
            }), {}),
          };
        }, {});

      const namespaceTranslation = () => {
        const translation = translations.find(
          (record) => record[i18nKey].namespace === namespace,
        );
        const innerTranslations = translation?.[i18nKey].translations ?? {};

        return Object.entries(innerTranslations).reduce(
          (output, [key, fn]) => ({
            ...output,
            [key]: this.#resolveTranslation({
              fn,
              globalLang: lang,
              key,
              allLanguages: globalLanguages,
            }),
          }),
          {},
        );
      };

      return (namespace ? namespaceTranslation() : allTranslations()) as ReturnTranslationsMerge<
        TLanguages,
        TNamespace,
        TTranslations
      >;
    };

    return useTranslation;
  }

  /** Validates if all the languages are implemented correctly and throws if not. */
  #validateLanguages<TTranslations extends Translations<TLanguages>>(
    namespace: string,
    rawTranslations: TTranslations,
  ) {
    const { languages: globalLanguages } = this.#config;

    const languagesEntries = Object.entries(rawTranslations);

    const areLanguagesValid = languagesEntries.every(([, fn]) => {
      const languages = fn({}).map((translation) => translation.lang);
      return globalLanguages.every((lang) => languages.includes(lang));
    });

    if (!areLanguagesValid) {
      const missingLanguagesInKey = languagesEntries
        .map(([key, fn]) => {
          const languages = fn({}).map((translation) => translation.lang);
          const missingLanguages = globalLanguages.filter((lang) => !languages.includes(lang));
          return missingLanguages.length ? `"${key}": "${missingLanguages.join('", "')}"` : null;
        })
        .filter(Boolean)
        .join('], [');

      throw new Error(
        `Not all the languages are implemented in namespace "${namespace}". Missing languages are: [${missingLanguagesInKey}].`,
      );
    }
  }

  #resolveTranslation(defaults: ResolveTranslationDefaults<TLanguages>) {
    const { fn, globalLang, key, allLanguages } = defaults;

    const { pluralizationResolver } = this.#config;

    /** Function to execute at runtime to get the translations. */
    const runtimeExecution = (runtimeOptions: RuntimeOptions<TLanguages> = {}) => {
      const { lang = globalLang, count, ...values } = runtimeOptions;

      const valuesToPass = { ...values, lang, count };

      if (fn.length && !Object.keys(runtimeOptions ?? {}).length) {
        throw new Error(
          `The translation "${key}" requires options to be passed at runtime.`,
        );
      }

      const translationsArray = fn(valuesToPass);
      const translatedValue = translationsArray.find((t) => t.lang === lang)?.value;

      if (!translatedValue) {
        const availableLanguages = allLanguages.map((lang) => `"${lang}"`).join(', ');
        throw new Error(
          `Language "${lang}" was not found. Available languages are: [${availableLanguages}].`,
        );
      }

      return pluralizationResolver(translatedValue, count);
    };

    return runtimeExecution;
  }
}

/** Value of a translation. */
export interface TranslationValue<TLang extends string> {
  /** Language of the translation. */
  lang: TLang;
  /** Value of the translation. */
  value: string | {
    /** Default value to use if no other value matches. */
    default: string;
    /** Value to use if the count is 0. */
    zero?: string;
    /** Value to use if the count is 1. */
    one?: string;
    /** Value to use if the count is 2. */
    two?: string;
    /** Value to use if the count is between 3 and 6. */
    few?: string;
    /** Value to use if the count is between 7 and 10. */
    many?: string;
    /** Value to use if the count is anything else. */
    other?: string;
  };
}

/** Returns all the namespaces of the given translations. */
type AllNamespaces<
  TLanguages extends string[],
  TTranslations extends InternalI18n<TLanguages>[],
> = TTranslations[number][typeof i18nKey]['namespace'];

/** Default values to use when resolving a translation. */
interface ResolveTranslationDefaults<TLanguages extends string[]> {
  key: string;
  fn: TranslationFn<TLanguages>;
  globalLang: TLanguages[number];
  allLanguages: TLanguages;
}

/** Metadata to pass to the translations to merge them better. */
interface InternalI18n<TLanguages extends string[]> {
  [i18nKey]: {
    namespace: string;
    translations: Record<PropertyKey, TranslationFn<TLanguages>>;
  };
}

/** Interpolates the [Key, Namespace] to the right format (Ex. 'namespace.key'). */
type WithNamespace<K, T> = `${T extends string ? T : ''}${K extends string ? K : ''}`;

/** Maps the values with the right options. */
type ReturnTranslations<
  TLanguages extends string[],
  TTranslations extends Record<string, TranslationFn<TLanguages>>,
  TNamespace = '',
> = {
  [Key in keyof TTranslations as WithNamespace<Key, TNamespace>]:
    Parameters<TTranslations[Key]>[0] extends { lang: unknown } | undefined
      // Optional options with base options.
      ? (options?: RuntimeOptions<TLanguages>) => string
      // Required options with dynamic params and optional base options.
      : (
        options:
          & Parameters<TTranslations[Key]>[0]
          & Omit<RuntimeOptions<TLanguages>, keyof Parameters<TTranslations[Key]>[0]>,
      ) => string;
};

// deno-lint-ignore no-explicit-any
type FindIndex<TTranslations extends any[], TNamespace extends any, I extends any[] = []> =
  TTranslations extends [infer Head, ...infer Rest]
    ? Head extends { [i18nKey]: { namespace: TNamespace } } ? I['length']
      // deno-lint-ignore no-explicit-any
    : FindIndex<Rest, TNamespace, [...I, any]>
    : never;

/** Maps the values with the right options in the merge method. */
type ReturnTranslationsMerge<
  TLanguages extends string[],
  TNamespace extends string | undefined,
  TTranslations extends InternalI18n<TLanguages>[],
> = TNamespace extends string ? {
    [
      K in keyof TTranslations[FindIndex<TTranslations, TNamespace>][typeof i18nKey][
        'translations'
      ] as WithNamespace<K, ''>
    ]: Parameters<
      TTranslations[FindIndex<TTranslations, TNamespace>][typeof i18nKey]['translations'][K]
    >[0] extends { lang: unknown } | undefined
      // Optional options with base options.
      ? (options?: RuntimeOptions<TLanguages>) => string
      // Required options with dynamic params and optional base options.
      : (
        options:
          & Parameters<
            TTranslations[FindIndex<TTranslations, TNamespace>][typeof i18nKey]['translations'][K]
          >[0]
          & Omit<
            RuntimeOptions<TLanguages>,
            keyof Parameters<
              TTranslations[FindIndex<TTranslations, TNamespace>][typeof i18nKey]['translations'][
                K
              ]
            >[0]
          >,
      ) => string;
  }
  : {
    [
      K in keyof ({
        [
          K in AllNamespaces<TLanguages, TTranslations> as `${K}.${
            & keyof TTranslations[FindIndex<TTranslations, K>][typeof i18nKey]['translations']
            & string}`
        ]: never;
      })
    ]: K extends `${infer Namespace}.${infer Key}` ? Parameters<
        TTranslations[FindIndex<TTranslations, Namespace>][typeof i18nKey]['translations'][Key]
      >[0] extends { lang: unknown } | undefined
        // Optional options with base options.
        ? (options?: RuntimeOptions<TLanguages>) => string
        // Required options with dynamic params and optional base options.
      : (
        options:
          & Parameters<
            TTranslations[FindIndex<TTranslations, Namespace>][typeof i18nKey]['translations'][Key]
          >[0]
          & Omit<
            RuntimeOptions<TLanguages>,
            keyof Parameters<
              TTranslations[FindIndex<TTranslations, Namespace>][typeof i18nKey]['translations'][
                Key
              ]
            >[0]
          >,
      ) => string
      : never;
  };

/** Function to use in a single translation. */
export type TranslationFn<TLanguages extends string[]> = (
  // Rule disabled since the value needs to be inferred and can be anything.
  // deno-lint-ignore no-explicit-any
  value: any,
) => { [K in keyof TLanguages]: TranslationValue<TLanguages[K]> };

/** Object with the translations for the given languages. */
export type Translations<TLanguages extends string[]> = Record<
  PropertyKey,
  TranslationFn<TLanguages>
>;

/** Options to use a translation. */
export interface UseTranslationOptions<TLanguages extends string[]> {
  /** Language to use. */
  lang?: TLanguages[number];
}

/** Options for the useTranslation function in the merge method. */
export interface UseTranslationOptionsMerge<TLanguages extends string[], TNamespace> {
  lang?: TLanguages[number];
  namespace?: TNamespace;
}

/** Base options for the runtime. */
export type RuntimeOptions<TLanguages extends string[]> = {
  count?: number;
  lang?: TLanguages[number];
};
