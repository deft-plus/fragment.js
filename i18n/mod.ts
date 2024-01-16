// import { H } from '@app_deps.ts';

// /** Internal symbol to mark the object with metadata. */
// const i18nKey = Symbol('__internal_i18n_meta__');

// /** Config to create a translation. */
// export interface I18nConfig<
//   TLanguages extends string[] = ['en'],
//   TFormatters extends Record<PropertyKey, unknown> = typeof defaultFormatters,
// > {
//   languages?: [...TLanguages];
//   formatters?: TFormatters;
//   pluralizationResolver?: PluralizationResolver;
// }

// /**
//  * Internalization API to create translations.
//  */
// export function i18n<
//   const TLanguages extends string[] = ['en'],
//   TFormatters extends Record<PropertyKey, unknown> = typeof defaultFormatters,
// >(config?: I18nConfig<TLanguages, TFormatters>) {
//   return new I18n(config);
// }

// /** I18n Implementation to create and merge translations. */
// class I18n<
//   TLanguages extends string[] = ['en'],
//   TFormatters extends Record<PropertyKey, unknown> = typeof defaultFormatters,
// > {
//   constructor(config?: I18nConfig<TLanguages, TFormatters>) {
//     this.#config = {
//       languages: ['en'] as TLanguages,
//       formatters: defaultFormatters as unknown as TFormatters,
//       pluralizationResolver: defaultPluralizationResolver,
//       ...config,
//     };
//   }

//   /** Private config to store the languages and formatters with the default values. */
//   #config: Required<I18nConfig<TLanguages, TFormatters>>;

//   /**
//    * Creates a new translation namespace.
//    */
//   public create<TNamespace extends string, TTranslations extends Translations<TLanguages>>(
//     namespace: TNamespace,
//     translations: (formatters: TFormatters) => TTranslations,
//   ) {
//     const { formatters, languages: globalLanguages } = this.#config;

//     const rawTranslations = translations(formatters);

//     this.#validateLanguages(namespace, rawTranslations);

//     /** Function to configure a global config to use the translations. */
//     const useTranslation = (options?: UseTranslationOptions<TLanguages>) => {
//       const optionsWithDefaults = {
//         lang: globalLanguages[0],
//         ...options,
//       };
//       const globalLang = optionsWithDefaults.lang;

//       // Object with all the translations to create.
//       const translations = Object.entries(rawTranslations).reduce((output, [key, fn]) => ({
//         ...output,
//         [key]: this.#resolveTranslation({ fn, globalLang, key, allLanguages: globalLanguages }),
//       }), {});

//       return translations as ReturnTranslations<TLanguages, TTranslations>;
//     };

//     return Object.assign(useTranslation, {
//       [i18nKey]: {
//         namespace,
//         translations: rawTranslations,
//       },
//     });
//   }

//   /**
//    * Merges the given translations with its own namespace.
//    */
//   public merge<TTranslations extends InternalI18n<TLanguages>[]>(translations: [...TTranslations]) {
//     const { languages: globalLanguages } = this.#config;

//     const useTranslation = <
//       TNamespace extends AllNamespaces<TLanguages, TTranslations> | undefined = undefined,
//     >(
//       options?: UseTranslationOptionsMerge<TLanguages, TNamespace>,
//     ) => {
//       const { lang, namespace } = {
//         lang: globalLanguages[0],
//         namespace: undefined,
//         ...options,
//       };

//       const allTranslations = () =>
//         translations.reduce((output, record) => {
//           const { namespace, translations } = record[i18nKey];

//           return {
//             ...output,
//             ...Object.entries(translations).reduce((innerOutput, [key, fn]) => ({
//               ...innerOutput,
//               [`${namespace}.${key}`]: this.#resolveTranslation({
//                 fn,
//                 globalLang: lang,
//                 key,
//                 allLanguages: globalLanguages,
//               }),
//             }), {}),
//           };
//         }, {});

//       const namespaceTranslation = () => {
//         const translation = translations.find(
//           (record) => record[i18nKey].namespace === namespace,
//         );
//         const innerTranslations = translation?.[i18nKey].translations ?? {};

//         return Object.entries(innerTranslations).reduce(
//           (output, [key, fn]) => ({
//             ...output,
//             [key]: this.#resolveTranslation({
//               fn,
//               globalLang: lang,
//               key,
//               allLanguages: globalLanguages,
//             }),
//           }),
//           {},
//         );
//       };

//       return (namespace ? namespaceTranslation() : allTranslations()) as ReturnTranslationsMerge<
//         TLanguages,
//         TNamespace,
//         TTranslations
//       >;
//     };

//     return useTranslation;
//   }

//   /** Validates if all the languages are implemented correctly and throws if not. */
//   #validateLanguages<TTranslations extends Translations<TLanguages>>(
//     namespace: string,
//     rawTranslations: TTranslations,
//   ) {
//     const { languages: globalLanguages } = this.#config;

//     const languagesEntries = Object.entries(rawTranslations);

//     const areLanguagesValid = languagesEntries.every(([, fn]) => {
//       const languages = fn({}).map((translation) => translation.lang);
//       return globalLanguages.every((lang) => languages.includes(lang));
//     });

//     if (!areLanguagesValid) {
//       const missingLanguagesInKey = languagesEntries
//         .map(([key, fn]) => {
//           const languages = fn({}).map((translation) => translation.lang);
//           const missingLanguages = globalLanguages.filter((lang) => !languages.includes(lang));
//           return missingLanguages.length ? `"${key}": "${missingLanguages.join('", "')}"` : null;
//         })
//         .filter(Boolean)
//         .join('], [');

//       throw new Error(
//         `Not all the languages are implemented in namespace "${namespace}". Missing languages are: [${missingLanguagesInKey}].`,
//       );
//     }
//   }

//   #resolveTranslation(defaults: ResolveTranslationDefaults<TLanguages>) {
//     const { fn, globalLang, key, allLanguages } = defaults;

//     const { pluralizationResolver } = this.#config;

//     /** Function to execute at runtime to get the translations. */
//     const runtimeExecution = (runtimeOptions: RuntimeOptions<TLanguages> = {}) => {
//       const { lang = globalLang, count, ...values } = runtimeOptions;

//       const valuesToPass = { ...values, lang, count };

//       if (fn.length && !Object.keys(runtimeOptions ?? {}).length) {
//         throw new Error(
//           `The translation "${key}" requires options to be passed at runtime.`,
//         );
//       }

//       const translationsArray = fn(valuesToPass);
//       const translatedValue = translationsArray.find((t) => t.lang === (lang ?? 'en'))?.value;

//       if (!translatedValue) {
//         const availableLanguages = allLanguages.map((lang) => `"${lang}"`).join(', ');
//         throw new Error(
//           `Language "${lang}" was not found. Available languages are: [${availableLanguages}].`,
//         );
//       }

//       return pluralizationResolver(translatedValue, count);
//     };

//     return runtimeExecution;
//   }
// }

// /** Default formatters to use inside of a translation value. */
// export const defaultFormatters = {
//   /** Transforms the given string to uppercase. */
//   upper(v?: string | null) {
//     return v?.toUpperCase() ?? '';
//   },
//   /** Transforms the given string to lowercase. */
//   lower(v?: string | null) {
//     return v?.toLowerCase() ?? '';
//   },
//   /** Capitalizes the given string. */
//   capitalize(v?: string | null) {
//     return v ? `${v.charAt(0).toUpperCase()}${v.slice(1)}` : '';
//   },
//   /** Transforms the given string to title case. */
//   title(v?: string | null) {
//     return v?.replace(/(^\w|\s\w)(\S*)/g, (_, m1, m2) => m1.toUpperCase() + m2.toLowerCase()) ?? '';
//   },
// };

// /** Default resolver to get the right pluralization. */
// export const defaultPluralizationResolver: PluralizationResolver = (values, count) => {
//   if (values === null || values === undefined) {
//     return '';
//   }

//   if (typeof values === 'string') {
//     return values;
//   }

//   if (count === 0 || count === undefined || count === null) {
//     return values.zero ?? values.default;
//   }

//   if (count === 1) {
//     return values.one ?? values.default;
//   }

//   if (count === 2) {
//     return values.two ?? values.default;
//   }

//   if (count >= 3 && count <= 6) {
//     return values.few ?? values.default;
//   }

//   if (count >= 7 && count <= 10) {
//     return values.many ?? values.default;
//   }

//   return values.other ?? values.many ?? values.default;
// };

// /** Value of a translation. */
// export interface TranslationValue<TLang extends string | H.arg0<string>> {
//   /** Language of the translation. */
//   lang: TLang;
//   /** Value of the translation. */
//   value: string | {
//     /** Default value to use if no other value matches. */
//     default: string;
//     /** Value to use if the count is 0. */
//     zero?: string;
//     /** Value to use if the count is 1. */
//     one?: string;
//     /** Value to use if the count is 2. */
//     two?: string;
//     /** Value to use if the count is between 3 and 6. */
//     few?: string;
//     /** Value to use if the count is between 7 and 10. */
//     many?: string;
//     /** Value to use if the count is anything else. */
//     other?: string;
//   };
// }

// /** Returns all the namespaces of the given translations. */
// type AllNamespaces<
//   TLanguages extends string[],
//   TTranslations extends InternalI18n<TLanguages>[],
// > = TTranslations[number][typeof i18nKey]['namespace'];

// /** Default values to use when resolving a translation. */
// interface ResolveTranslationDefaults<TLanguages extends string[]> {
//   key: string;
//   fn: TranslationFn<TLanguages>;
//   globalLang?: TLanguages[number];
//   allLanguages: TLanguages;
// }

// /** Metadata to pass to the translations to merge them better. */
// interface InternalI18n<TLanguages extends string[]> {
//   [i18nKey]: {
//     namespace: string;
//     translations: Record<PropertyKey, TranslationFn<TLanguages>>;
//   };
// }

// /** Interpolates the [Key, Namespace] to the right format (Ex. 'namespace.key'). */
// type WithNamespace<K, T> = `${T extends string ? T : ''}${K extends string ? K : ''}`;
// /** Maps the values with the right options. */
// type ReturnTranslations<
//   TLanguages extends string[],
//   TTranslations extends Record<string, TranslationFn<TLanguages>>,
//   TNamespace = '',
// > = {
//   [Key in keyof TTranslations as WithNamespace<Key, TNamespace>]:
//     Parameters<TTranslations[Key]>[0] extends { lang: unknown } | undefined
//       // Optional options with base options.
//       ? (options?: RuntimeOptions<TLanguages>) => string
//       // Required options with dynamic params and optional base options.
//       : (
//         options:
//           & Parameters<TTranslations[Key]>[0]
//           & Omit<RuntimeOptions<TLanguages>, keyof Parameters<TTranslations[Key]>[0]>,
//       ) => string;
// };

// /** Implementation to merge all the translations into one with the namespace. */
// interface MergeTranslationsImpl<
//   TLanguages extends string[],
//   TNamespace extends boolean,
// > extends H.Fn {
//   return: ReturnTranslations<
//     TLanguages,
//     this['arg0'][typeof i18nKey]['translations'], // Gets translations type.
//     TNamespace extends true ? `${this['arg0'][typeof i18nKey]['namespace']}.` : '' // Gets namespace.
//   >;
// }

// /** Maps the values with the right options in the merge method. */
// type ReturnTranslationsMerge<
//   TLanguages extends string[],
//   TNamespace,
//   TTranslations,
// > = H.Eval<
//   H.Match<TNamespace, [
//     // Namespace selected.
//     H.Match.With<
//       string,
//       H.Pipe<TTranslations, [
//         H.Tuples.Find<H.Booleans.Extends<{ [i18nKey]: { namespace: TNamespace } }>>,
//         MergeTranslationsImpl<TLanguages, false>,
//       ]>
//     >,
//     // Namespace not selected.
//     H.Match.With<
//       undefined,
//       H.Pipe<TTranslations, [
//         H.Tuples.Map<MergeTranslationsImpl<TLanguages, true>>,
//         H.Tuples.ToIntersection,
//       ]>
//     >,
//   ]>
// >;

// /** Function to use in a single translation. */
// export type TranslationFn<TLanguages extends string[]> = (
//   // Rule disabled since the value needs to be inferred and can be anything.
//   // deno-lint-ignore no-explicit-any
//   value: any,
// ) => TranslationTuple<TLanguages>;

// /** Maps the languages tuple to the right values. */
// export type TranslationTuple<TLanguages extends string[]> = H.Pipe<TLanguages, [
//   H.Tuples.Map<
//     H.Objects.Create<
//       TranslationValue<H.arg0<string>>
//     >
//   >,
// ]>;

// /** Object with the translations for the given languages. */
// export type Translations<TLanguages extends string[]> = Record<
//   PropertyKey,
//   TranslationFn<TLanguages>
// >;

// /** Options to use a translation. */
// export interface UseTranslationOptions<TLanguages extends string[]> {
//   /** Language to use. */
//   lang?: TLanguages[number];
// }

// /** Options for the useTranslation function in the merge method. */
// export interface UseTranslationOptionsMerge<TLanguages extends string[], TNamespace> {
//   lang?: TLanguages[number];
//   namespace?: TNamespace;
// }

// /** Pluralization resolver to pass to the translations. */
// export type PluralizationResolver = (
//   values: TranslationValue<string>['value'] | null | undefined,
//   count?: number,
// ) => string;

// /** Base options for the runtime. */
// export type RuntimeOptions<TLanguages extends string[]> = {
//   count?: number;
//   lang?: TLanguages[number];
// };
