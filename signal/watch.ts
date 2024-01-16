/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

import { ReactiveNode, setActiveConsumer } from './graph.ts';

/**
 * A cleanup function that can be optionally registered from the watch logic. If registered, the
 * cleanup logic runs before the next watch execution.
 */
export type WatchCleanupFn = () => void;

/** Callback function to call when changes are detected. */
export type WatchCallback = () => void | WatchCleanupFn;

/** No operation function. */
const NOOP_CLEANUP_FN: WatchCleanupFn = () => {};

/**
 * Watches a reactive expression and allows it to be scheduled to re-run
 * when any dependencies notify of a change.
 *
 * `Watch` doesn't run reactive expressions itself, but relies on a consumer-
 * provided scheduling operation to coordinate calling `Watch.run()`.
 */
export class Watch extends ReactiveNode {
  protected override readonly consumerAllowSignalWrites: boolean;
  private dirty = false;
  private cleanupFn = NOOP_CLEANUP_FN;

  constructor(
    private watch: WatchCallback,
    private schedule: (watch: Watch) => void,
    allowSignalWrites: boolean,
  ) {
    super();
    this.consumerAllowSignalWrites = allowSignalWrites;
  }

  notify(): void {
    if (!this.dirty) {
      this.schedule(this);
    }
    this.dirty = true;
  }

  protected override onConsumerDependencyMayHaveChanged(): void {
    this.notify();
  }

  protected override onProducerUpdateValueVersion(): void {
    // Watches are not producers.
  }

  /**
   * Execute the reactive expression in the context of this `Watch` consumer.
   *
   * Should be called by the user scheduling algorithm when the provided
   * `schedule` hook is called by `Watch`.
   */
  run(): void {
    this.dirty = false;
    if (this.trackingVersion !== 0 && !this.consumerPollProducersForChange()) {
      return;
    }

    const prevConsumer = setActiveConsumer(this);
    this.trackingVersion++;
    try {
      this.cleanupFn();
      const cleanup = this.watch();
      this.cleanupFn = cleanup ?? NOOP_CLEANUP_FN;
    } finally {
      setActiveConsumer(prevConsumer);
    }
  }

  cleanup() {
    this.cleanupFn();
  }
}
