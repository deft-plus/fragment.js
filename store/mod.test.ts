/**
 * @license
 * Copyright Deft+ All Rights Reserved.
 *
 * Use of this source code is governed by an Apache-2.0 license that can be
 * found in the LICENSE file at https://github.com/deft-plus/fragment.js/blob/latest/LICENCE
 */

import { assertEquals, delay, describe, it } from '@app_deps_testing.ts';
import { store } from './mod.ts';

describe('store()', () => {
  type CounterStore = {
    count: number;
    increment: () => void;
    decrement: () => void;
    reset: () => void;
  };

  const counterStore = store<CounterStore>((get) => ({
    count: 0,
    increment: () => get().count.update((count) => count + 1),
    decrement: () => get().count.update((count) => count - 1),
    reset: () => get().count.set(0),
  }));

  it('should create basic store and be able to call values and actions', () => {
    const counter = counterStore();

    assertEquals(counter.count(), 0);

    counter.increment();

    assertEquals(counter.count(), 1);

    counter.decrement();

    assertEquals(counter.count(), 0);

    counter.increment();
    counter.increment();

    assertEquals(counter.count(), 2);

    counter.reset();

    assertEquals(counter.count(), 0);
  });

  it('should allow to use the selector', () => {
    const count = counterStore('count');
    const increment = counterStore('increment');

    assertEquals(count(), 0);

    increment();

    assertEquals(count(), 1);

    increment();

    assertEquals(count(), 2);
  });

  it('should allow to use promises and derrived values', async () => {
    type AuthStore = {
      user: User | null;
      uid: () => string | null;
      signUp: (username: string, password: string) => Promise<User>;
      signIn: (username: string, password: string) => Promise<User | null>;
      signOut: () => Promise<boolean>;
    };

    type User = {
      uid: string;
      username: string;
      password: string;
    };

    const mockedUsers: User[] = [];

    const User = {
      create: async (username: string, password: string) => {
        await delay(20);
        const user = { uid: `${mockedUsers.length + 1}`, username, password };
        mockedUsers.push(user);
        return user;
      },
      read: async (username: string) => {
        await delay(20);
        const user = mockedUsers.find((user) => user.username === username);
        return user ?? null;
      },
      update: async (uid: string, username: string, password: string) => {
        await delay(20);
        const user = mockedUsers.find((user) => user.uid === uid);
        if (user) {
          user.username = username;
          user.password = password;
        }
        return user ?? null;
      },
      delete: async (uid: string) => {
        await delay(20);
        const user = mockedUsers.find((user) => user.uid === uid);
        if (user) {
          mockedUsers.splice(mockedUsers.indexOf(user), 1);
        }
        return user ?? null;
      },
    };

    const authStore = store<AuthStore>((get) => ({
      user: null,
      uid: () => get()?.user()?.uid ?? null, // uid is a derived value from user.
      signIn: async (username, password) => {
        const userSignedIn = await User.read(username);
        if (userSignedIn?.password !== password) {
          get().user.set(null);
          return null;
        }
        get().user.set(userSignedIn);
        return userSignedIn;
      },
      signOut: async () => {
        await delay(20);
        get().user.set(null);
        return true;
      },
      signUp: async (username, password) => {
        const newUser = await User.create(username, password);

        get().user.set(newUser);

        return newUser;
      },
    }));

    const auth = authStore();

    assertEquals(auth.uid(), null);

    await auth.signUp('username', 'password');

    assertEquals(auth.uid(), '1');

    await auth.signOut();

    assertEquals(auth.uid(), null);

    await auth.signIn('username', 'password');

    assertEquals(auth.uid(), '1');
    assertEquals(auth.user(), { uid: '1', username: 'username', password: 'password' });

    await auth.signOut();

    assertEquals(auth.uid(), null);
    assertEquals(auth.user(), null);
  });
});
