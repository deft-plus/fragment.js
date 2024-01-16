// import { type FragmentContext, type FragmentSelector } from './mod.ts';
// import { type ReadonlySignal, type WritableSignal } from '../../signal/mod.ts';

// /**
//  * A fragment primitive attribute is a value that can be passed to a fragment to define a raw
//  * attribute, this can be use to pass to the fragment call and to the html tag.
//  */
// export type PrimitiveAttribute = string | number | boolean | undefined;

// /**
//  * A fragment base computed attribute is a value that is calculated from the host attributes.
//  * This is the base type for a fragment computed attribute and just a reference.
//  */
// export type ComputedAttribute = (host: unknown) => unknown;

// /**
//  * A fragment attribute is a value that can be passed to a fragment to define an attribute.
//  */
// export type FragmentAttribute = PrimitiveAttribute | ComputedAttribute;

// /**
//  * Type for when a fragment does not have any attributes.
//  */
// export type NoAttributes = null | undefined | never | void;

// /**
//  * When a fragment has attributes, it must be a record with a key and a value.
//  */
// export type Attributes = Record<string, BaseAttributeType<unknown, 'attribute' | 'computed'>>;

// /**
//  * Valid attributes you can use to create a fragment.
//  */
// export type ValidAttributes = Attributes | NoAttributes;

// /**
//  * Base type for the attribute type.
//  */
// export type BaseAttributeType<TValue, TType extends string | unknown> = {
//   __attributeType: TType;
//   __value: TValue;
//   __valueType:
//     | 'string'
//     | 'number'
//     | 'boolean'
//     | 'undefined'
//     | 'object'
//     | 'array'
//     | 'function'
//     | 'symbol';
// };

// /**
//  * Exported type to create an attribute type for the end user.
//  */
// export type PrimitiveAttributeType<TValue extends PrimitiveAttribute> = BaseAttributeType<
//   TValue,
//   'attribute'
// >;

// /**
//  * Exported type to create a computed type for the end user.
//  */
// export type ComputedAttributeType<TValue> = BaseAttributeType<TValue, 'computed'>;

// /**
//  * Utility type to show a basic error for the reserved names.
//  */
// type ErrorMessage<TErrorKey extends string> = [
//   TErrorKey,
//   `Property "${TErrorKey}" is no allowed since it is a reserved name. Please use another name.`,
// ];

// /**
//  * High order type that maps the given `Attributes` and assigns the `PrimitiveMatcher` to the
//  * primitive attributes and the `ComputedMatcher` to the computed attributes.
//  */
// type MapAttributes<TAttributes extends ValidAttributes, TPrimitiveMatcher, TComputedMatcher> =
//   H.Pipe<
//     TAttributes,
//     [
//       H.Match<[
//         // If no attributes retruns never.
//         H.Match.With<NoAttributes, never>,
//         H.Match.With<
//           Attributes,
//           H.ComposeLeft<[
//             H.Objects.Entries,
//             H.Unions.ToTuple,
//             H.Tuples.Map<
//               // Error if the attribute is a reserved name.
//               H.Match<[
//                 H.Match.With<['self', unknown], ErrorMessage<'self'>>,
//                 H.Match.With<['children', unknown], ErrorMessage<'children'>>,
//                 H.Match.With<['fallback', unknown], ErrorMessage<'fallback'>>,
//                 H.Match.With<['errorBoundary', unknown], ErrorMessage<'errorBoundary'>>,

//                 H.Match.With<
//                   [string, BaseAttributeType<unknown, 'attribute'>],
//                   TPrimitiveMatcher
//                 >,
//                 H.Match.With<
//                   [string, BaseAttributeType<unknown, 'computed'>],
//                   TComputedMatcher
//                 >,

//                 H.Match.With<[string, unknown], H.arg0>,
//               ]>
//             >,
//             H.Tuples.ToUnion,
//             H.Objects.FromEntries,
//           ]>
//         >,
//       ]>,
//     ]
//   >;

// /** Type with the base self properties to share with the content and the computed attributes. */
// type SelfConfig = {
//   self: Readonly<{
//     selector: FragmentSelector;
//     wrapper: 'none' | keyof HTMLElementTagNameMap;
//     shadowMode?: ShadowRootMode;
//     context: FragmentContext;
//   }>;
// };

// /** Utility type to get the value type passed by the end user. */
// type GetAttributeType<T extends BaseAttributeType<unknown, unknown>> = T['__value'];

// /** Matcher type using HotScript to map the values to configure the defaults. */
// interface ConfigMatcher<TAttributes extends ValidAttributes = NoAttributes> extends H.Fn {
//   return: TAttributes extends NoAttributes
//     // If no attributes it means is an primitive attribute.
//     ? [this['arg0'][0], GetAttributeType<this['arg0'][1]>]
//     // If has attributes it means is a computed attribute.
//     : [
//       this['arg0'][0],
//       (self: ReadOnlyAttributes<TAttributes, this['arg0'][0]>) => GetAttributeType<this['arg0'][1]>,
//     ];
// }

// /** Matcher type using HotScript to map the values as signals. */
// interface SignalMatcher<TReadOnly extends boolean> extends H.Fn {
//   return: [
//     this['arg0'][0],
//     TReadOnly extends true
//       // Read only signal.
//       ? ReadonlySignal<GetAttributeType<this['arg0'][1]>>
//       : WritableSignal<GetAttributeType<this['arg0'][1]>>,
//   ];
// }

// /**
//  * Attributes for the fragment config.
//  */
// export type ConfigAttributes<TAttributes extends ValidAttributes> = MapAttributes<
//   TAttributes,
//   ConfigMatcher<NoAttributes>,
//   ConfigMatcher<TAttributes>
// >;

// /**
//  * Attributes to send to the computed attributes.
//  * All of the attributes are read only signals since you can only change the value of an attribute
//  * from the content itself, this avoid too many side-effects.
//  */
// export type ReadOnlyAttributes<TAttributes extends ValidAttributes, SelfName extends string> = Omit<
//   (MapAttributes<TAttributes, SignalMatcher<true>, SignalMatcher<true>> & SelfConfig),
//   SelfName
// >;

// /**
//  * Attributes for the fragment content.
//  * All of the primitive attributes are writable signals, this allows the end user to change the
//  * value of the attribute from the content. The computed attributes are read only signals since
//  * a computed attribute only changes when the primitive attributes it depends on change.
//  */
// export type ContentAttributes<TAttributes extends ValidAttributes> =
//   & MapAttributes<TAttributes, SignalMatcher<false>, SignalMatcher<true>>
//   & SelfConfig;
