import { markFragment } from './api.ts';
import { ReadonlySignal, WritableSignal } from '../signal/mod.ts';

type Primitive = string | number | boolean | null | undefined;
type Computed<T> = () => T;

type ValidAttributes = Record<string, Primitive | Computed<unknown>>;

type InferAttributes<T extends ValidAttributes> = {
  // All properties must be optional
  [K in keyof T]?: T[K] extends Primitive
    ? // Primitive value
      T[K]
    : T[K] extends Computed<infer R>
    ? // Computed value
      R extends void
      ? never
      : (attrs: InferAttributesWithSignals<Omit<T, K>>) => R
    : never;
};

type InferAttributesWithSignals<T extends ValidAttributes, Write = false> = {
  [K in keyof T]: T[K] extends Primitive
    ? // Primitive value
      Write extends true
      ? WritableSignal<T[K]>
      : ReadonlySignal<T[K]>
    : T[K] extends () => infer R
    ? // Computed value
      ReadonlySignal<R>
    : never;
} & {
  _context: any;
  _ref: any;
};

type RemoveComputed<T extends ValidAttributes> = {
  [K in keyof T as T[K] extends () => unknown ? never : K]: T[K];
};

export type FragmentOptions<T extends ValidAttributes> = {
  /** Name for the fragment (For debugging purposes). */
  name: string;
  /** Function that returns the content of the fragment. */
  content: (props: InferAttributesWithSignals<T, true>) => JSX.Element | Promise<JSX.Element>;
  /** Default values for the attributes passed to the fragment. */
  attributes?: InferAttributes<T>;
  /** Wrapper for the fragment. */
  wrapper?: string;
  /** Function that returns the fallback when the content is async. */
  fallback?: (props: InferAttributesWithSignals<T>) => JSX.Element;
};

export function fragment<const T extends ValidAttributes>(options: FragmentOptions<T>) {
  const frag = (props: RemoveComputed<T>) => {
    return {
      element: options.wrapper ?? options.name,
      name: options.name,
      props,
      children: options.content(props as unknown as InferAttributesWithSignals<T, true>),
    } as JSX.Element;
  };

  markFragment(frag);

  return frag;
}
