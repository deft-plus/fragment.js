import { cli } from '@app_deps.ts';

import { devCommand } from './dev.ts';
import { i18nCommand } from '../i18n/cli/mod.ts';
import { VERSION } from '../version.ts';

// Help is the default command if no args are passed.
const hasNoArgs = Deno.args.length === 0;
const hasOnlyI18nArg = Deno.args.length === 1 && Deno.args[0] === 'i18n';
if (hasNoArgs || hasOnlyI18nArg) {
  Deno.args.push('help');
}

await new cli.cliffy.command.Command()
  .name('Fragmente TS')
  .version(VERSION)
  .description('Fragmente TS is a tool to help you create and manage your web components')
  .command('dev', devCommand)
  .command('i18n', i18nCommand)
  .parse(Deno.args);
