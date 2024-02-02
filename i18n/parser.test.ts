/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

import { assertEquals, assertThrows, describe, it } from '@app_deps_testing.ts';
import { parseText } from './parser.ts';

describe('parseText()', () => {
  it('should parse a simple text', () => {
    const parsedText = parseText('Hello World');
    assertEquals(parsedText, [
      {
        kind: 'text',
        content: 'Hello World',
      },
    ]);
  });

  it('should parse a parameter without type', () => {
    const parsedText = parseText('Hello {name}');
    assertEquals(parsedText, [
      {
        kind: 'text',
        content: 'Hello ',
      },
      {
        kind: 'parameter',
        key: 'name',
        type: 'unknown',
        optional: false,
        transforms: [],
      },
    ]);
  });

  it('should parse a parameter with type', () => {
    const parsedText = parseText('Hello {name:string}');
    assertEquals(parsedText, [
      {
        kind: 'text',
        content: 'Hello ',
      },
      {
        kind: 'parameter',
        key: 'name',
        type: 'string',
        optional: false,
        transforms: [],
      },
    ]);
  });

  it('should parse a mixed parameter (with and without type)', () => {
    const parsedText = parseText('{name} and {otherName:string} are here!');
    assertEquals(parsedText, [
      {
        kind: 'parameter',
        key: 'name',
        type: 'unknown',
        optional: false,
        transforms: [],
      },
      {
        kind: 'text',
        content: ' and ',
      },
      {
        kind: 'parameter',
        key: 'otherName',
        type: 'string',
        optional: false,
        transforms: [],
      },
      {
        kind: 'text',
        content: ' are here!',
      },
    ]);
  });

  it('should parse a parameter with whitespace', () => {
    const parsedText = parseText('Hello { name : string }');
    assertEquals(parsedText, [
      {
        kind: 'text',
        content: 'Hello ',
      },
      {
        kind: 'parameter',
        key: 'name',
        type: 'string',
        optional: false,
        transforms: [],
      },
    ]);
  });

  it('should parse a optional parameter', () => {
    const parsedText = parseText('Hello { name?:string }');
    assertEquals(parsedText, [
      {
        kind: 'text',
        content: 'Hello ',
      },
      {
        kind: 'parameter',
        key: 'name',
        type: 'string',
        optional: true,
        transforms: [],
      },
    ]);
  });

  it('should parse plural', () => {
    const parsedText = parseText('Test{{count:s}}');
    assertEquals(parsedText, [
      {
        kind: 'text',
        content: 'Test',
      },
      {
        kind: 'plural',
        key: 'count',
        other: 's',
      },
    ]);
  });

  it('should parse plural where the key is the previous number parameter', () => {
    const parsedText = parseText('{count:number} Test{{s}}');
    assertEquals(parsedText, [
      {
        kind: 'parameter',
        key: 'count',
        type: 'number',
        optional: false,
        transforms: [],
      },
      {
        kind: 'text',
        content: ' Test',
      },
      {
        kind: 'plural',
        key: 'count',
        other: 's',
      },
    ]);
  });

  it('should throw trying to parse a plural with a key', () => {
    assertThrows(() => parseText('Test{{s}}'));
    assertThrows(() => parseText('{name:string} Test{{s}}'));
  });

  it('should parse plural singular-only', () => {
    /* spell-checker: disable */
    const parsedText = parseText('{count:number} weitere{{s|}} Mitglied{{er}}');
    assertEquals(parsedText, [
      {
        kind: 'parameter',
        key: 'count',
        type: 'number',
        optional: false,
        transforms: [],
      },
      {
        kind: 'text',
        content: ' weitere',
      },
      {
        kind: 'plural',
        key: 'count',
        one: 's',
        other: '',
      },
      {
        kind: 'text',
        content: ' Mitglied',
      },
      {
        kind: 'plural',
        key: 'count',
        other: 'er',
      },
    ]);
    /* spell-checker: enable */
  });

  it('should parse plural zero-one-other', () => {
    const parsedText = parseText('The list includes {{ count : no items | an item | ?? items }}');
    assertEquals(parsedText, [
      {
        kind: 'text',
        content: 'The list includes ',
      },
      {
        kind: 'plural',
        key: 'count',
        zero: 'no items',
        one: 'an item',
        other: '?? items',
      },
    ]);
  });

  it('should parse plural full syntax and use the key from the previos plural', () => {
    const parsedText = parseText('I have {{count:zero|one|two|a few|many|a lot}} apple{{s}}');
    assertEquals(parsedText, [
      {
        kind: 'text',
        content: 'I have ',
      },
      {
        kind: 'plural',
        key: 'count',
        zero: 'zero',
        one: 'one',
        two: 'two',
        few: 'a few',
        many: 'many',
        other: 'a lot',
      },
      {
        kind: 'text',
        content: ' apple',
      },
      {
        kind: 'plural',
        key: 'count',
        other: 's',
      },
    ]);
  });

  it('should parse plural full syntax and use the key from the previos parameter', () => {
    const parsedText = parseText('{{prev:0 apples|1 apple|?? apples}} / {count:number} apple{{s}}');
    assertEquals(parsedText, [
      {
        kind: 'plural',
        key: 'prev',
        zero: '0 apples',
        one: '1 apple',
        other: '?? apples',
      },
      {
        kind: 'text',
        content: ' / ',
      },
      {
        kind: 'parameter',
        key: 'count',
        type: 'number',
        optional: false,
        transforms: [],
      },
      {
        kind: 'text',
        content: ' apple',
      },
      {
        kind: 'plural',
        key: 'count',
        other: 's',
      },
    ]);
  });

  it('should parse parameter with formatter', () => {
    const parsedText = parseText('Hello {name:string|uppercase}');
    assertEquals(parsedText, [
      {
        kind: 'text',
        content: 'Hello ',
      },
      {
        kind: 'parameter',
        key: 'name',
        type: 'string',
        optional: false,
        transforms: [
          {
            kind: 'formatter',
            name: 'uppercase',
          },
        ],
      },
    ]);
  });

  it('should parse parameter with multiple formatters', () => {
    const parsedText = parseText('Hello {name:string|uppercase|lowercase}');
    assertEquals(parsedText, [
      {
        kind: 'text',
        content: 'Hello ',
      },
      {
        kind: 'parameter',
        key: 'name',
        type: 'string',
        optional: false,
        transforms: [
          {
            kind: 'formatter',
            name: 'uppercase',
          },
          {
            kind: 'formatter',
            name: 'lowercase',
          },
        ],
      },
    ]);
  });

  it('should parse multiple parameters and formatters', () => {
    const parsedText = parseText('Hi {name: string | upper}, today is: {date: Date | dateTime}');
    assertEquals(parsedText, [
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
        content: ', today is: ',
      },
      {
        kind: 'parameter',
        key: 'date',
        type: 'Date',
        optional: false,
        transforms: [
          {
            kind: 'formatter',
            name: 'dateTime',
          },
        ],
      },
    ]);
  });

  it('should parse switch-case statement', () => {
    const parsedText = parseText('{choice|{ male: his, female: her, *: their }}');
    assertEquals(parsedText, [
      {
        kind: 'parameter',
        key: 'choice',
        type: 'unknown',
        optional: false,
        transforms: [
          {
            kind: 'switch-case',
            raw: '{ male: his, female: her, *: their }',
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
          },
        ],
      },
    ]);
  });

  it('should parse switch-case statement allowing escape commas', () => {
    const parsedText = parseText('{choice|{ yes: I was indeed\\, a cool person , no: I was not }}');
    assertEquals(parsedText, [
      {
        kind: 'parameter',
        key: 'choice',
        type: 'unknown',
        optional: false,
        transforms: [
          {
            kind: 'switch-case',
            raw: '{ yes: I was indeed\\, a cool person , no: I was not }',
            cases: [
              {
                key: 'yes',
                value: 'I was indeed, a cool person',
              },
              {
                key: 'no',
                value: 'I was not',
              },
            ],
          },
        ],
      },
    ]);
  });
});
