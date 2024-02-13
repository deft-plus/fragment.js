/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

import { assertEquals, delay, describe, it } from '@app_deps_testing.ts';
import { effect, signal } from './mod.ts';
import { WritableSignal } from './signal.ts';

type TestingUser = {
  name: string;
  age: number;
};

describe('signal()', () => {
  it('should create a signal', () => {
    const counter = signal(0);

    assertEquals(counter(), 0);
  });

  it('should set a signal', () => {
    const counter = signal(0);

    counter.set(1);

    assertEquals(counter(), 1);
  });

  it('should update a signal', () => {
    const counter = signal(0);

    counter.update((value) => value + 1);

    assertEquals(counter(), 1);
  });

  it('should mutate a signal', () => {
    const counter = signal<TestingUser>({ name: 'Alice', age: 42 });

    counter.mutate((value) => {
      value.name = 'Bob';
    });

    assertEquals(counter().name, 'Bob');
  });

  it('should create a readonly signal', () => {
    const counter = signal(0).readonly();

    assertEquals(counter(), 0);

    const signalFnKeys = Object.keys(counter);
    const writableKeys = signalFnKeys.find((key) =>
      key === 'set' || key === 'update' || key === 'mutate'
    );

    assertEquals(writableKeys, undefined);
  });

  it('should subscribe to readonly signals', () => {
    const privateCounter = signal(0);

    const counter = {
      mutable: privateCounter,
      readonly: privateCounter.readonly(),
    };

    assertEquals(counter.readonly(), 0);

    const signalFnKeys = Object.keys(counter.readonly);
    const writableKeys = signalFnKeys.find((key) =>
      key === 'set' || key === 'update' || key === 'mutate'
    );

    assertEquals(writableKeys, undefined);

    privateCounter.set(1);

    assertEquals(counter.readonly(), 1);

    counter.mutable.set(2);

    assertEquals(counter.readonly(), 2);
  });

  it('should allow to use `onChange` hook', () => {
    const called = [] as number[];

    const counter = signal(0, {
      onChange: (value) => called.push(value),
    });

    assertEquals(called, []);

    counter.set(1);
    assertEquals(called, [1]);

    counter.set(23);
    assertEquals(called, [1, 23]);

    counter.set(23);
    assertEquals(called, [1, 23]);
  });

  it('should allow to use computed values', () => {
    const counter = signal(0);
    const doubleCounter = () => counter() * 2;

    assertEquals(doubleCounter(), 0);

    counter.set(1);

    assertEquals(doubleCounter(), 2);
  });

  it('should allow to pass signals as params and subscribe to changes', () => {
    const firstName = signal('Alice');
    const lastName = signal('Smith');

    type Signals = {
      firstName: WritableSignal<string>;
      lastName: WritableSignal<string>;
    };

    const buildDisplayName = ({ firstName, lastName }: Signals) => `${firstName()} ${lastName()}`;

    const displayName = () => buildDisplayName({ firstName, lastName });

    assertEquals(displayName(), 'Alice Smith');

    firstName.set('Bob');

    assertEquals(displayName(), 'Bob Smith');
  });

  it('should allow to use memoized values', () => {
    const counter = signal(0);
    const doubleCounter = signal.memo(() => counter() * 2);

    assertEquals(doubleCounter(), 0);

    counter.set(1);

    assertEquals(doubleCounter(), 2);
  });

  it('should allow to use memoized values with different equals fn', () => {
    const counter = signal(0);

    // Can only be set to a value greater than or equal to the current value.
    const doubleCounter = signal.memo(
      () => counter() * 2,
      { equal: (a, b) => a >= b },
    );

    assertEquals(doubleCounter(), 0);

    counter.set(1);

    assertEquals(doubleCounter(), 2);

    counter.set(4);

    assertEquals(doubleCounter(), 8);

    counter.set(2);

    assertEquals(doubleCounter(), 8);

    counter.set(1);

    assertEquals(doubleCounter(), 8);
  });

  it('should schedule on dependencies (memoized) change', async () => {
    const counter = signal(0);
    const doubleCounter = signal.memo(() => counter() * 2);

    const effectCounter = [] as number[];

    effect(() => {
      effectCounter.push(doubleCounter());
    });

    await delay(1);
    assertEquals(effectCounter, [0]);

    counter.set(1);

    await delay(1);
    assertEquals(effectCounter, [0, 2]);
  });

  it('should not make surrounding effect depend on the signal', async () => {
    const counter = signal(0);

    const effectCounter = [] as number[];

    effect(() => {
      effectCounter.push(counter.untracked());
    });

    await delay(1);
    assertEquals(effectCounter, [0]);

    counter.set(1);

    await delay(1);
    assertEquals(effectCounter, [0]);
  });
});
