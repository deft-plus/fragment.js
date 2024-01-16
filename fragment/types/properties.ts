// import {
//   type BaseAttributeType,
//   type ContentAttributes,
//   type FragmentElement,
//   type ValidAttributes,
// } from './mod.ts';

// /**
//  * Properties that are passed to a fragment call function by default.
//  */
// export type WithDefaultProps<Attrs> =
//   & Omit<Attrs, 'self' | 'children' | 'fallback' | 'errorBoundary'>
//   & {
//     children?: FragmentElement | FragmentElement[];
//     fallback?: FragmentElement | FragmentElement[];
//     errorBoundary?: {
//       fallback: FragmentElement | FragmentElement[];
//       onError?: (error: Error) => void;
//       onReset?: (details: {
//         reason: string;
//         next: unknown;
//         prev: unknown;
//       }) => void;
//     };
//   };

// /**
//  * Internal type to identify the type of the property.
//  */
// type InternalAttributeType<T extends string> = { __attributeType: T };

// /** Extracts the value type from a `BaseType`. */
// type InferType<Value, Type extends string> = Value extends BaseAttributeType<infer V, Type> ? V
//   : never;

// /** Filters the given `Attrs` to contain only the ones that are of the given `Type`. */
// type MapAttrsToOnly<Type extends string, Attrs> = {
//   [P in keyof Attrs as Attrs[P] extends InternalAttributeType<Type> ? P : never]: InferType<
//     Attrs[P],
//     Type
//   >;
// };

// /** Maps the given `Attrs` to contain only primitive attributes. */
// export type OnlyPrimitiveAttrs<Attrs> = MapAttrsToOnly<'attribute', Attrs>;
// /** Check it the given `Attrs` have any primitive attribute. */
// export type HasAttributes<Attrs> = keyof OnlyPrimitiveAttrs<Attrs> extends never ? false : true;

// /** Maps the given `Attrs` to contain only computed attributes. */
// export type OnlyComputedAttrs<Attrs> = MapAttrsToOnly<'computed', Attrs>;
// /** Check it the given `Attrs` have any computed attribute. */
// export type HasComputed<Attrs> = keyof OnlyComputedAttrs<Attrs> extends never ? false : true;

// /**
//  * Properties that are passed to a fragment content to use by the end user.
//  */
// export type FragmentProps<Attrs extends ValidAttributes> = ContentAttributes<Attrs>;
