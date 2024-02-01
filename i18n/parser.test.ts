/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

import { assertEquals, describe, it } from '@app_deps_testing.ts';
import { parseText } from './parser.ts';

describe('parseText()', () => {
  it('should parse a simple text', () => {
    const text = 'Hi {name:string}!';
    const parsedText = parseText(text);

    assertEquals(parsedText, [
      {
        content: 'Hi ',
        kind: 'text',
      },
      {
        kind: 'parameter',
        key: 'name',
        optional: false,
        transforms: [],
        type: 'string',
      },
      {
        content: '!',
        kind: 'text',
      },
    ]);

    const text2 = '{amount:number} {{amount:cat|cats}}';
    const parsedText2 = parseText(text2);

    assertEquals(parsedText2, [
      {
        kind: 'parameter',
        key: 'amount',
        optional: false,
        transforms: [],
        type: 'number',
      },
      {
        content: ' ',
        kind: 'text',
      },
      {
        kind: 'plural',
        key: 'amount',
        one: 'cat',
        other: 'cats',
      },
    ]);

    const text3 = '{amount?:number}{{cat|cats}}';
    const parsedText3 = parseText(text3);

    assertEquals(parsedText3, [
      {
        kind: 'parameter',
        key: 'amount',
        optional: true,
        transforms: [],
        type: 'number',
      },
      {
        kind: 'plural',
        key: 'amount',
        one: 'cat',
        other: 'cats',
      },
    ]);

    const text4 =
      '{username:string} added a new photo to {gender:string|{ male: his, female: her, *: their }} stream.';
    const parsedText4 = parseText(text4);

    assertEquals(parsedText4, [
      {
        kind: 'parameter',
        key: 'username',
        optional: false,
        transforms: [],
        type: 'string',
      },
      {
        kind: 'text',
        content: ' added a new photo to ',
      },
      {
        kind: 'parameter',
        key: 'gender',
        type: 'string',
        optional: false,
        transforms: [
          {
            kind: 'switch-case',
            cases: [
              {
                key: 'male',
                value: 'his',
              },
              {
                key: 'female',
                value: 'her',
              },
              {
                key: '*',
                value: 'their',
              },
            ],
            raw: '{ male: his, female: her, *: their }',
          },
        ],
      },
      {
        kind: 'text',
        content: ' stream.',
      },
    ]);

    const text5 = 'Hi {name:string|upper}!';
    const parsedText5 = parseText(text5);

    assertEquals(parsedText5, [
      {
        kind: 'text',
        content: 'Hi ',
      },
      {
        kind: 'parameter',
        key: 'name',
        type: 'string',
        optional: false,
        transforms: [
          {
            kind: 'formatter',
            name: 'upper',
          },
        ],
      },
      {
        kind: 'text',
        content: '!',
      },
    ]);

    const text6 =
      '{text:string|{ yes: An additional tax\\, will be collected. , no: No taxes apply. }}';
    const parsedText6 = parseText(text6);

    assertEquals(parsedText6, [
      {
        kind: 'parameter',
        key: 'text',
        type: 'string',
        optional: false,
        transforms: [
          {
            kind: 'switch-case',
            cases: [
              {
                key: 'yes',
                value: 'An additional tax, will be collected.',
              },
              {
                key: 'no',
                value: 'No taxes apply.',
              },
            ],
            raw: '{ yes: An additional tax\\, will be collected. , no: No taxes apply. }',
          },
        ],
      },
    ]);
  });
});
