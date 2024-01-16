export const FRAGMENT = Symbol('__internal_fragment_meta__');

/** Checks if the given `value` function is a fragment. */
export function isFragment(value: unknown): value is JSX.Element {
  return (value as JSX.Frag)[FRAGMENT] !== undefined;
}

/** Marks the given `value` as a fragment. */
export function markFragment(value: unknown) {
  Object.defineProperty(value, FRAGMENT, {
    value: true,
    writable: false,
  });
  return value;
}
