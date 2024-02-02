/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

/**
 * Function parses a raw text into a ParsedMessage object.
 */
export function parseText(rawText: string): ParsedMessage {
  let lastNumberKeyForPlural = '';

  return rawText
    .split(RegexBracketsSplit)
    .map((part) => {
      // If the part is empty or undefined, return null to filter it out.
      if (!part) {
        return null;
      }

      // If the part doesn't match the regex, it's a text part.
      if (!part.match(RegexBracketsSplit)) {
        return { kind: 'text', content: part };
      }

      const content = removeOuterBrackets(part);

      // If the content starts with a bracket, it's a plural part.
      if (content.startsWith('{')) {
        const [pluralPart, lastKey] = parsePluralPart(
          removeOuterBrackets(content),
          lastNumberKeyForPlural,
        );

        if (lastKey) {
          lastNumberKeyForPlural = lastKey;
        }

        return formatValues(pluralPart, ['other']);
      }

      // Otherwise, it's a parameter part.
      const parsedPart = parseParamenterPart(content);

      // This allows us to use the last number key as the key to get the count for plurals.
      if (parsedPart.type === 'number') {
        lastNumberKeyForPlural = parsedPart.key;
      }

      return formatValues(parsedPart);
    })
    .filter(Boolean) as ParsedMessage;
}

/** Regex to match switch cases. */
const regexSwitchCase = /^\{.*\}$/;
/** Regex to match brackets. */
const RegexBracketsSplit = /(\{(?:[^{}]+|\{(?:[^{}]+)*\})*\})/g;

/**
 * Helper function to remove the outer brackets of a string.
 */
const removeOuterBrackets = (text: string) => text.substring(1, text.length - 1);

/**
 * Helper function to format the values of an object, array or string.
 * Removes empty values and trims strings.
 */
const formatValues = (part: unknown, allowedEmptyKeys: string[] = []): unknown => {
  // If the input is a string, trim it.
  if (typeof part === 'string') {
    return part.trim();
  }

  // If the input is not an object, return as is.
  if (!part || typeof part !== 'object') {
    return part;
  }

  // If the input is an array, filter and recursively call the function on each element.
  if (Array.isArray(part)) {
    return part
      .map((item) => formatValues(item, allowedEmptyKeys))
      .filter((item) => !!item);
  }

  // If the input is an object, filter and recursively call the function on each property.
  return Object.entries(part)
    .filter(([key, value]) =>
      allowedEmptyKeys.includes(key) ||
      (typeof value !== 'undefined' &&
        value !== '' &&
        value !== null &&
        value !== undefined)
    )
    .reduce((acc, [key, value]) => {
      acc[key] = typeof value === 'string' ? value.trim() : formatValues(value, allowedEmptyKeys);
      return acc;
    }, {} as Record<string, unknown>);
};

/**
 * Helper function to parse switch cases from a string.
 */
const parseSwitchCases = (text: string): TransformParameterSwitchCaseCasePart[] => {
  return removeOuterBrackets(text)
    .replace(/\\,/g, '<<COMMA>>') // Temporarily replace escaped commas.
    .split(',')
    .map((part) => {
      const [key, value] = part.split(':').map((entry) => entry.trim());
      return {
        key,
        value: value.replace(/<<COMMA>>/g, ','), // Restore escaped commas.
      };
    });
};

/**
 * Helper function to parse a parameter/switch statement part from a string.
 */
const parseParamenterPart = (text: string): ParameterPart => {
  const [keyPart = '', ...formatterKeys] = text.split('|');

  const [keyWithoutType = '', type = 'unknown'] = keyPart.split(':');
  const [key, isOptional] = keyWithoutType.split('?') as [string, string | undefined];

  return {
    kind: 'parameter',
    key,
    type,
    optional: isOptional === '',
    transforms: formatterKeys.map((t) => {
      const isSwitchCase = t.match(regexSwitchCase);

      return isSwitchCase
        ? {
          kind: 'switch-case',
          cases: parseSwitchCases(t),
          raw: t,
        }
        : {
          kind: 'formatter',
          name: t,
        };
    }),
  };
};

/**
 * Helper function to parse a plural part from a string.
 */
const parsePluralPart = (content: string, lastAccessor: string): [PluralPart, string?] => {
  let [key, values] = content.split(':') as [string, string?];

  // This is a special case where the key is not provided, but the values are provided.
  // In this case, we use the last accessor as the key.
  if (!values) {
    values = key;
    key = lastAccessor;
  }

  if (!key) {
    throw new Error('Plural key is not provided.');
  }

  const entries = values.split('|');
  const [zero, one, two, few, many, rest] = entries;

  const entriesCount = entries.filter((entry) => entry !== undefined).length;
  const kind = 'plural';

  if (entriesCount === 1) {
    return [{ kind, key, other: zero }, key];
  }
  if (entriesCount === 2) {
    return [{ kind, key, one: zero, other: one }, key];
  }
  if (entriesCount === 3) {
    return [{ kind, key, zero, one, other: two }, key];
  }

  return [{ kind, key, zero, one, two, few, many, other: rest }, key];
};

/**
 * Type definitions for the parsed message.
 */
export type ParsedMessage = ParsedMessagePart[];

/**
 * Type definitions for the parsed message part.
 */
export type ParsedMessagePart = TextPart | PluralPart | ParameterPart;

/**
 * Type definitions for the text part.
 */
export type TextPart = {
  kind: 'text';
  content: string;
};

/**
 * Type definitions for the plural part.
 */
export type PluralPart = {
  kind: 'plural';
  // No need to get the key type since it should always be a number.
  key: string;
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
};

/**
 * Type definitions for the parameter part.
 */
export type ParameterPart = {
  kind: 'parameter';
  key: string;
  type: string;
  optional: boolean;
  transforms: TransformParameterPart[];
};

/**
 * Type definitions for the transform parameter part.
 */
export type TransformParameterPart =
  | TransformParameterFormatterPart
  | TransformParameterSwitchCasePart;

/**
 * Type definitions for the transform parameter formatter part.
 */
export type TransformParameterFormatterPart = {
  kind: 'formatter';
  name: string;
};

/**
 * Type definitions for the transform parameter switch case part.
 */
export type TransformParameterSwitchCasePart = {
  kind: 'switch-case';
  cases: TransformParameterSwitchCaseCasePart[];
  raw?: string;
};

/**
 * Type definitions for the transform parameter switch case case part.
 */
export type TransformParameterSwitchCaseCasePart = {
  key: string;
  value: string;
};
