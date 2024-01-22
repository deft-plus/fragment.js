import { type TranslationValue } from './__mod.ts';

/**
 * Resolver to get the right pluralization in the i18n translations.
 */
export type PluralizationResolver = (
  values: TranslationValue<string>['value'] | null | undefined,
  count?: number,
) => string;

/** Default resolver to get the right pluralization in the English language. */
export const pluralizationResolver: Record<'english', PluralizationResolver> = {
  english: (values, count) => {
    if (values === null || values === undefined) {
      return '';
    }

    if (typeof values === 'string') {
      return values;
    }

    if (count === 0 || count === undefined || count === null) {
      return values.zero ?? values.default;
    }

    if (count === 1) {
      return values.one ?? values.default;
    }

    if (count === 2) {
      return values.two ?? values.default;
    }

    if (count >= 3 && count <= 6) {
      return values.few ?? values.default;
    }

    if (count >= 7 && count <= 10) {
      return values.many ?? values.default;
    }

    return values.other ?? values.many ?? values.default;
  },
};
