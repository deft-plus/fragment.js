import { cli } from '@app_deps.ts';

import { dev } from './dev.ts';

await new cli.cliffy.command.Command()
  .name('Fragmente TS')
  .version('0.0.1')
  .description('Fragmente TS is a tool to help you create and manage your web components')
  .command('dev', dev)
  .parse(Deno.args);
