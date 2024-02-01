/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

export type I18nOptions = {
  formatters: Record<string, (value: string) => string>;
};

export function i18n(options: I18nOptions) {
  const trans = {} as Record<string, unknown>;

  const t = (locale: string) => trans[locale] as Record<string, (...args: unknown[]) => string>;

  const load = (resource: {
    locale: string;
    translations: Record<string, string>;
  }) => {
    trans[resource.locale] = Object.fromEntries(
      Object.entries(resource.translations).map(([key, value]) => {
        const val = (args: Record<string, string>) => {
          // TODO(@miguelbogota): Implement a better parser and pluralization.
          const parsedValue = value.replace(/{(\w+):(\w+)(?:\|(\w+))?}/g, (_, p1, __, p3) => {
            const formatter = options.formatters[p3];
            const value = args[p1];
            return formatter ? formatter(value) : value;
          });
          return parsedValue;
        };
        return [key, val];
      }),
    );
  };

  const fn = Object.assign(t, { load });

  return fn;
}
