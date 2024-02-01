/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

import { assertEquals, describe, it } from '@app_deps_testing.ts';
import { i18n } from './mod.ts';

const locale = 'en-US';

const translations = {
  'Hi {name:string}!': 'Hi {name:string}!',
  'Today is {value:string|upper}': 'Today is {value:string|upper}',
  'I own {amount:number} car{{amount:s}}': 'I own {amount:number} car{{amount:s}}',
};

const formatters = {
  upper: (value: string) => value.toUpperCase(),
};

describe('i18n()', () => {
  it('should instantiate the i18n correctly', () => {
    const i18nFactory = i18n({ formatters });

    i18nFactory.load({ locale, translations });

    const t = i18nFactory(locale);

    assertEquals(t['Hi {name:string}!']({ name: 'John' }), 'Hi John!');
    assertEquals(t['Today is {value:string|upper}']({ value: 'Friday' }), 'Today is FRIDAY');
  });
});
