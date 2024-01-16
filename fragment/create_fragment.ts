// import {
//   type ComputedAttributeType,
//   type CreateFragmentConfig,
//   type FragmentElement,
//   type NoAttributes,
//   type OnlyPrimitiveAttrs,
//   type PrimitiveAttribute,
//   type PrimitiveAttributeType,
//   type ValidAttributes,
//   type WithDefaultProps,
// } from './types/mod.ts';

// type NoProps = (props?: WithDefaultProps<unknown>) => FragmentElement;
// type WithProps<Attrs> = (props: WithDefaultProps<OnlyPrimitiveAttrs<Attrs>>) => FragmentElement;
// type FragmentCall<Attrs> = (keyof Attrs extends never ? NoProps : WithProps<Attrs>) & {
//   extra: string;
// };
// type Props<Attrs> = OnlyPrimitiveAttrs<Attrs>;

// export const fragment = <Attrs extends ValidAttributes = NoAttributes>(
//   config: CreateFragmentConfig<Attrs>,
// ): FragmentCall<Attrs> => {
//   // deno-lint-ignore no-empty-pattern
//   const {} = config;

//   return ((_props: Props<Attrs>) => '__test__') as FragmentCall<Attrs>;
// };

// /**
//  * Typings to create attributes in a fragment.
//  */
// // deno-lint-ignore no-namespace
// export namespace T {
//   export type Attribute<V extends PrimitiveAttribute> = PrimitiveAttributeType<V>;
//   export type Computed<V> = ComputedAttributeType<V>;
// }
