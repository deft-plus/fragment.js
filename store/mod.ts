/// Stores are a way to manage global state in your application. They use signals internally to
/// store values and update them. You can also derive values from other values.
///
/// The reason why stores are immutable is because they are not meant to be changed directly, but
/// rather through the actions that are defined in the store.
///
/// You would want to use a store over a signal when you need to store multiple values that are
/// related to each other. This makes it easier to manage the state of your application with a
/// single source of truth.

import { type ReadonlySignal, signal, type WritableSignal } from '../signal/mod.ts';

/**
 * Creates a reactive atomic piece of state (store) that can be read through signals and written
 * through actions.
 */
export const store = <T extends ValidStore>(storeValues: StoreValues<T>): Store<T> => {
  let state: WritableState<T> | undefined = undefined;
  const initialState = storeValues(() => (state as WritableState<T>));

  const stateEntries = Object.entries(initialState);
  const mutableState = {} as ValidStore;
  const immutableState = {} as ValidStore;

  for (let index = 0; index < stateEntries.length; index++) {
    const [stateKey, stateValue] = stateEntries[index];

    // If the value is a function, it's an action / derived value.
    if (typeof stateValue === 'function') {
      mutableState[stateKey] = stateValue;
      immutableState[stateKey] = stateValue;
      continue;
    }

    // If the value is not a function, it's a signal.
    const valueSignal = signal(stateValue);
    mutableState[stateKey] = valueSignal;
    immutableState[stateKey] = valueSignal.readonly();
  }

  state = mutableState as WritableState<T>;

  function useStore<U extends (keyof T) | undefined = undefined>(selector?: U) {
    return selector ? immutableState[selector] : immutableState;
  }

  return useStore as Store<T>;
};

/** Utility type to check if a value is a valid store. */
type ValidStore = Record<PropertyKey, unknown>;

/** Utility type to map the values of the state. */
type StateImpl<T extends ValidStore, TReadonly extends boolean> =
  & {
    [K in keyof T]: T[K] extends (...args: infer Args) => infer R ? (
        // If the value is a function, it is treated as an action.
        // The return type of the action is the same as the return type of the function.
        (...args: Args) => R
      )
      : (
        // If the value is not a function, it is treated as a signal.
        // The return type of the signal is the same as the value.
        TReadonly extends true ? ReadonlySignal<T[K]> : WritableSignal<T[K]>
      );
  }
  // This is here to avoid showing the full type to the end-user.
  & { name: string };

/**
 * Maps all the values of the object.
 *
 * - Functions are treated as actions and leave them as they are.
 * - And any other value will be treated as a `WritableSignal`.
 */
export type WritableState<T extends ValidStore> = StateImpl<T, false>;

/**
 * Maps all the values of the object.
 *
 * - Functions are treated as actions and leave them as they are.
 * - And any other value will be treated as a `ReadonlySignal`.
 */
export type ReadonlyState<T extends ValidStore> = StateImpl<T, true>;

/** Function to create the store with the initial values. */
export type StoreValues<T extends ValidStore> = (
  // The return type of the state (WritableState<T>) cannot be null, but it is initially undefined
  // when the store is created. This is because the state has not been created yet. Even if it
  // could be nullable, it would be inconvenient to use because you would constantly need to check
  // whether the state has been created or not. Therefore, the typings enforce that the state must
  // be non-nullable.
  state: () => WritableState<T>,
) => T;

/**
 * A store is a function that returns an atomic and encapsulated state. It can be read through
 * signals and written through actions.
 */
export type Store<T extends ValidStore> = <U extends (keyof T) | undefined = undefined>(
  selector?: U,
) => U extends keyof ReadonlyState<T>
  // Returns the value of the given key.
  ? ReadonlyState<T>[U]
  // Returns the full state.
  : ReadonlyState<T>;
