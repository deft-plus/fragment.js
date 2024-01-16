import { cli } from '@app_deps.ts';

import { dev } from './dev.ts';
import { VERSION } from '../version.ts';

await new cli.cliffy.command.Command()
  .name('Fragmente TS')
  .version(VERSION)
  .description('Fragmente TS is a tool to help you create and manage your web components')
  .command('dev', dev)
  .parse(Deno.args);
