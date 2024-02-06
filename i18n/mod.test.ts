/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

import { assertEquals, describe, it } from '@app_deps_testing.ts';
import { i18n, type I18nResource } from './mod.ts';

const resources: I18nResource[] = [
  {
    locale: 'en',
    translations: {
      hello: 'Hi {name:string}!',
      today: 'Today is {value:string|upper}',
      cars: 'I own {amount:number} car{{amount:s}}',
    },
  },
  {
    locale: 'en-US',
    translations: {
      hello: 'Hi {name:string}!',
      today: 'Today is {value:string|upper}',
      cars: 'I own {amount:number} car{{amount:s}}',
    },
  },
  {
    locale: 'es',
    translations: {
      hello: '¡Hola {name:string}!',
      today: 'Hoy es {value:string|upper}',
      cars: 'Tengo {amount:number} auto{{amount:s}}',
    },
  },
  {
    locale: 'es-ES',
    translations: {
      hello: '¡Hola {name:string}!',
      cars: 'Tengo {amount:number} coche{{amount:s}}',
    },
  },
  {
    locale: 'es-CO',
    translations: {
      today: 'Hoy es {value:string|upper}',
      cars: 'Tengo {amount:number} carro{{amount:s}}',
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
  it('should instantiate the i18n correctly', () => {
    const i18nFactory = i18n({ formatters });

    resources.forEach((resource) => {
      i18nFactory.load({ locale: resource.locale, translations: resource.translations });
    });

    const t1 = i18nFactory('en-US');

    assertEquals(t1.hello({ name: 'John' }), 'Hi John!');
    assertEquals(t1.today({ value: 'Friday' }), 'Today is FRIDAY');

    const t2 = i18nFactory('es-CO');

    assertEquals(t2.hello({ name: 'John' }), '¡Hola John!');
    assertEquals(t2.today({ value: 'Viernes' }), 'Hoy es VIERNES');
    assertEquals(t2.cars({ amount: 2 }), 'Tengo 2 carros');

    const t3 = i18nFactory('fr');

    assertEquals(t3.hello({ name: 'John' }), 'Hi John!');
  });
});
