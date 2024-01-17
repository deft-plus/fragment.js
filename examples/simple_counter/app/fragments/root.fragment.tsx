import { fragment } from '@fragment.js';

import { Counter } from './counter.fragment.tsx';

export const Root = fragment({
  name: 'app-root',
  content: () => (
    <div>
      <h1>Simple Counter</h1>
      <Counter />
    </div>
  ),
});
