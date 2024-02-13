/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

export type RootOptions = {
  target: HTMLElement;
  plugins: unknown[];
};

export function root(options: RootOptions) {
  const { target } = options;

  console.log('Root created', target);

  return {
    mount(fragment: JSX.Element) {
      console.log('Root mounted', fragment);
    },
  };
}
