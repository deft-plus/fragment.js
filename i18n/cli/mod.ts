/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

import { cli } from '@app_deps.ts';
import { serveCommand } from './serve.ts';
import { getCommand } from './get.ts';

export const i18nCommand = new cli.cliffy.command.Command()
  .name('i18n')
  .version('0.0.1')
  .description('i18n is a tool to help you create and manage your translations')
  .command('serve', serveCommand)
  .command('get', getCommand);
