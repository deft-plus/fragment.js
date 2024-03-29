/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

import { assertEquals, assertThrows, beforeEach, describe, it } from '@app_deps_testing.ts';
import { i18n, type I18nResource } from './i18n.ts';

type I18nTranslations = {
  basic: 'Hello World!';
  withParameter: 'Hi {name:string}!';
  withFormatter: 'Today is {value:string|upper}';
  withPlural: 'I own {amount:number} car{{amount:s}}';
  withPlural2: 'I own car{{amount:s}}';
  withSwitch: 'This is {gender|{ male: his, female: her, *: their }} car';
};

const resources: I18nResource[] = [
  {
    namespace: 'default',
    locale: 'en',
    translations: {
      basic: 'Hello World!',
      withParameter: 'Hi {name:string}!',
      withFormatter: 'Today is {value:string|upper}',
      withPlural: 'I own {amount:number} car{{amount:s}}',
      withPlural2: 'I own car{{amount:s}}',
      withSwitch: 'This is {gender|{ male: his, female: her, *: their }} car',
    },
  },
  {
    namespace: 'default',
    locale: 'en-US',
    translations: {
      basic: 'Hello World!',
      withParameter: 'Hi {name:string}!',
      withFormatter: 'Today is {value:string|upper}',
      withPlural: 'I own {amount:number} car{{amount:s}}',
      withSwitch: 'This is {gender|{ male: his, female: her, *: their }} car',
    },
  },
  {
    namespace: 'default',
    locale: 'es',
    translations: {
      basic: '¡Hola Mundo!',
      withParameter: '¡Hola {name:string}!',
      withFormatter: 'Hoy es {value:string|upper}',
      withPlural: 'Tengo {amount:number} auto{{amount:s}}',
      withSwitch: 'Este es su auto',
    },
  },
  {
    namespace: 'default',
    locale: 'es-ES',
    translations: {
      basic: '¡Hola Mundo!',
      withParameter: '¡Hola {name:string}!',
      withPlural: 'Tengo {amount:number} coche{{amount:s}}',
      withSwitch: 'Este es su coche',
    },
  },
  {
    namespace: 'default',
    locale: 'es-CO',
    translations: {
      basic: '¡Hola Mundo!',
      withFormatter: 'Hoy es {value:string|upper}',
      withPlural: 'Tengo {amount:number} carro{{amount:s}}',
      withSwitch: 'Este es su carro',
    },
  },
];

const formatters = {
  upper: (value: unknown) => {
    if (typeof value !== 'string') {
      throw new Error('upper formatter only accepts strings');
    }
    return value.toUpperCase();
  },
};

describe('i18n()', () => {
  beforeEach(() => {
    // Removes all translations on each test.
    i18n.clear();
  });

  it('should instantiate the i18n correctly', () => {
    const i18nFactory = i18n({ formatters });

    resources.forEach((resource) => {
      i18nFactory.load(resource);
    });

    const t = i18nFactory<I18nTranslations>({ locale: 'en-US', namespace: 'default' });

    assertEquals(t.basic(), 'Hello World!');
  });

  it('should grab the correct locale', () => {
    const i18nFactory = i18n({ formatters });

    resources.forEach((resource) => {
      i18nFactory.load(resource);
    });

    const t1 = i18nFactory<I18nTranslations>({ locale: 'en-US', namespace: 'default' });

    assertEquals(t1.basic(), 'Hello World!');
    assertEquals(t1.withParameter({ name: 'John' }), 'Hi John!');
    assertEquals(t1.withFormatter({ value: 'Friday' }), 'Today is FRIDAY');
    assertEquals(t1.withPlural({ amount: 1 }), 'I own 1 car');
    assertEquals(t1.withPlural2({ amount: 2 }), 'I own cars');
    assertEquals(t1.withSwitch({ gender: 'male' }), 'This is his car');
  });

  it('should get the default locale (The first one) if it is not found', () => {
    const i18nFactory = i18n({ formatters });

    resources.forEach((resource) => {
      i18nFactory.load(resource);
    });

    const t = i18nFactory<I18nTranslations>({ locale: 'fr', namespace: 'default' });

    assertEquals(t.basic(), 'Hello World!');
  });

  it('should throw an error if the locale is not found and there is no default locale', () => {
    const i18nFactory = i18n({ formatters });

    assertThrows(() => i18nFactory<I18nTranslations>({ locale: 'fr', namespace: 'default' }));
  });

  it('should get the closest locale if it is not found', () => {
    const i18nFactory = i18n({ formatters });

    resources.forEach((resource) => {
      i18nFactory.load(resource);
    });

    const t = i18nFactory<I18nTranslations>({ locale: 'es-CO', namespace: 'default' });

    assertEquals(t.withParameter({ name: 'John' }), '¡Hola John!');
  });

  it('should allow to load different namespaces', () => {
    const i18nFactory = i18n({ formatters });

    resources.forEach((resource) => {
      i18nFactory.load(resource);
    });

    i18nFactory.load({
      namespace: 'login',
      locale: 'en',
      translations: {
        basic: 'Hello World!',
      },
    });

    const tLogin = i18nFactory<{ basic: 'Hello World!' }>({ locale: 'en', namespace: 'login' });
    const tDefault = i18nFactory<I18nTranslations>({ locale: 'en', namespace: 'default' });

    assertEquals(tLogin.basic(), 'Hello World!');
    assertEquals(tDefault.basic(), 'Hello World!');
  });
});
