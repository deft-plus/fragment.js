import './types.d.ts';
import { isFragment } from '../fragment/api.ts';
import { raw } from './html_utils.ts';
import { html } from './html_utils.ts';

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

  console.log(funElement.children);

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

const jsxTemplate = html;

const jsxAttr = (name: string, value: string) => raw(name + '="' + html`${value}` + '"');

const jsxEscape = (unsafe: string) => unsafe;

export { jsx, jsx as jsxs, jsxAttr, jsxEscape, jsxTemplate };
