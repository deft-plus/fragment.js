// Disables since this is a dependency file.
// deno-lint-ignore-file no-external-import no-unused-vars ban-unused-ignore no-namespace

export * as DenoDom from 'https://deno.land/x/deno_dom@v0.1.41-alpha-artifacts/deno-dom-wasm.ts';

// This is heavy so is commented for now to avoid loading it.
// export { default as bdc } from 'https://unpkg.com/@mdn/browser-compat-data@5.3.23/data.json' assert { type: 'json' };

// Standard library
import * as _async from 'https://deno.land/std@0.185.0/async/mod.ts';
import * as _flags from 'https://deno.land/std@0.185.0/flags/mod.ts';

export namespace std {
  export import async = _async;
  export import flags = _flags;
}

// CLI
import * as _cliffy from 'https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts';
import * as _crayon from 'https://deno.land/x/crayon@3.3.3/mod.ts';
import { open as _open } from 'https://deno.land/x/open@v0.0.6/index.ts';

export namespace cli {
  export const open = _open;
  export import crayon = _crayon;
  export namespace cliffy {
    export import command = _cliffy;
  }
}
