// deno-lint-ignore no-external-import
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.41-alpha-artifacts/deno-dom-wasm.ts';

import { root } from '@fragment.js';
import { Root } from './fragments/root.fragment.tsx';

const doc = new DOMParser().parseFromString(
  `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body>
  <div id="root"></div>
</body>

</html>`,
  'text/html',
);

const app = root({
  target: doc?.getElementById('root'),
});

app.mount(<Root />);
