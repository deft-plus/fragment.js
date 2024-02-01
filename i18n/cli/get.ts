/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

import { cli, std } from '@app_deps.ts';

export const getCommand = new cli.cliffy.command.Command()
  .name('get')
  .version('0.0.1')
  .description('Download the translations from the server')
  .option('-u, --url <url:string>', 'Url to download the translations from', { required: true })
  .action(async ({ url }) => {
    console.log(`Getting translations from "${url}"`);
    await std.async.delay(1000);
    console.log('Translations downloaded');
    return Promise.resolve();
  });
