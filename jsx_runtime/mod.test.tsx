/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

import { fragment } from '../fragment/mod.ts';

// This will throw an error
const Hello1 = fragment<{ name: string }>({
  name: 'app-hello-1',
  content: ({ name }) => {
    return (
      <div class={name()}>
        <div>Hello {name()}</div>
        <div>Hello</div>
        <Hello2 name='Carlos' />
      </div>
    );
  },
});

const Hello2 = fragment<{ name: string }>({
  name: 'app-hello-2',
  content: ({ name }) => {
    return (
      <div>
        <div>Hello {name()}</div>
        <div>Hello</div>
      </div>
    );
  },
});

console.log('Test:', <Hello1 name='Miguel' />);
