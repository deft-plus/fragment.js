import './types.d.ts';
import { isFragment } from '../fragment/api.ts';

function jsx(
  element: string | ((...args: any) => any),
  props: Record<PropertyKey, unknown> | null,
  key?: string | number | null,
) {
  if (typeof element === 'function' && !isFragment(element)) {
    throw new Error(`Element "${element.name}" is not a fragment!`);
    // console.error(`Element "${element.name}" is not a fragment!`);
  }

  const funElement = typeof element === 'function' && element(props);
  const { children, ...otherProps } = props ?? {};

  const res = funElement
    ? {
      name: funElement.name,
      element: funElement.wrapper ?? funElement.element,
      props: otherProps,
      children: funElement.children,
      key,
    }
    : {
      name: element,
      element,
      props: otherProps,
      children,
      key,
    };

  return res;
}

const jsxTemplate = (template: string[], ...args: unknown[]) => {
  const res = template.reduce((acc, cur, i) => {
    return `${acc}${cur}${args[i] ?? ''}`;
  }, '');
  return res;
};

const jsxEscape = (unsafe: unknown) => unsafe;

const jsxAttr = (name: string, value: unknown) => ` ${name}="${value}"`;

export { jsx, jsx as jsxs, jsxAttr, jsxEscape, jsxTemplate };
