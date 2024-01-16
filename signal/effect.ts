/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

import { Watch, WatchCallback } from './watch.ts';
import { std } from '@app_deps.ts';

/** Callback function for the `effect()` function that is called when changes are detected. */
export type EffectCallback = WatchCallback;

/** A global reactive effect, which can be manually destroyed. */
export type EffectRef = {
  /** Shut down the effect, removing it from any upcoming scheduled executions. */
  destroy(): void;
};

/** Options passed to the `effect` function. */
export type CreateEffectOptions = {
  /**
   * Whether the `effect` should allow writing to signals.
   *
   * Using effects to synchronize data by writing to signals can lead to confusing and potentially
   * incorrect behavior, and should be enabled only when necessary.
   */
  allowSignalWrites?: boolean;
};

/** All active effects. */
const all = new Set<Watch>();
/** Effects that are queued for execution. */
const queue = new Set<Watch>();

/** A promise that resolves when the watch queue is empty. */
let watchQueue: std.async.Deferred<void> | null = null;

/** Create a global `Effect` for the given reactive function. */
export function effect(
  callback: EffectCallback,
  options: CreateEffectOptions = {},
): EffectRef {
  const { allowSignalWrites = false } = options;

  const watch = new Watch(callback, queueWatch, allowSignalWrites);
  all.add(watch);

  // Effects start dirty.
  watch.notify();

  const destroy = () => {
    watch.cleanup();
    all.delete(watch);
    queue.delete(watch);
  };

  return {
    destroy,
  };
}

/** Shut down all active effects. */
export function resetEffects(): void {
  queue.clear();
  all.clear();
}

/** Internal function to queue a watch for execution. */
function queueWatch(watch: Watch): void {
  if (queue.has(watch) || !all.has(watch)) {
    return;
  }

  queue.add(watch);

  if (watchQueue === null) {
    Promise.resolve().then(runWatchQueue);
    watchQueue = std.async.deferred();
  }
}

/** Internal function to run the watch queue. */
function runWatchQueue(): void {
  for (const watch of queue) {
    queue.delete(watch);
    watch.run();
  }

  watchQueue?.resolve();
  watchQueue = null;
}
