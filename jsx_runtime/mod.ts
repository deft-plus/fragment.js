/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

import './types.d.ts';
import { isFragment } from '../fragment/api.ts';

/**
 * The `jsx` function is used to create the nodes that will be rendered by the `render` function.
 */
export function jsx(
  element: unknown,
  props?: Record<PropertyKey, unknown> | null,
  key?: string | number | null,
) {
  if (typeof element === 'function' && !isFragment(element)) {
    throw new Error(`Element "${element.name}" is not a fragment!`);
  }

  const funElement = typeof element === 'function' && element(props);
  const { children, ...otherProps } = props ?? {};

  const res = funElement
    ? {
      name: funElement.name,
      element: funElement.wrapper ?? funElement.element,
      props: otherProps,
      key,
      children: funElement.children,
    }
    : {
      name: element,
      element,
      props: otherProps,
      key,
      children,
    };

  return res;
}

/**
 * The `jsxs` function is used to create the nodes that will be rendered by the `render` function.
 */
export const jsxs = jsx;

/**
 * The `jsxDEV` function is used to create the nodes that will be rendered by the `render` function.
 */
export const jsxDEV = jsx;

/**
 * The `Fragment` will be used to group multiple nodes together.
 */
export const Fragment = (props: Record<PropertyKey, unknown>) => props.children;
