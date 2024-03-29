/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

import { cli } from '@app_deps.ts';

export const serveCommand = new cli.cliffy.command.Command()
  .name('serve')
  .version('0.0.1')
  .description('host the translations on a local server')
  .option('-d, --port <port:integer>', 'Port to use', { default: 5900 })
  .option('-o, --open [open:boolean]', 'Open the browser', { default: false })
  .option('--host <host:string>', 'Host to use', { default: 'localhost' })
  .action((options) => {
    const { port, host, open } = options;

    Deno.serve({
      port,
      hostname: host,
      onListen: async (s) => {
        const url = `http://${s.hostname}:${s.port}`;

        if (open) {
          await cli.open(url);
        }

        console.log(
          cli.crayon.crayon.green.bold(
            `\nServer is up and running at ${url}\n`,
          ),
        );
      },
    }, () => {
      return new Response(`Hello World, ${Deno.cwd()} hello`);
    });
  });
