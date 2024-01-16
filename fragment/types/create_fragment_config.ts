// import {
//   type ConfigAttributes,
//   type FragmentContent,
//   type FragmentElement,
//   type FragmentSelector,
//   type NoAttributes,
//   type ReadOnlyAttributes,
//   type ValidAttributes,
// } from './mod.ts';

// /**
//  * Configuration to create a fragment.
//  */
// export type CreateFragmentConfig<Attrs extends ValidAttributes = NoAttributes> = {
//   /**
//    * Name with dash to effectively allow the HTML parser to tell the difference between true custom
//    * elements and regular elements. It also allows us to enable a level of future capability when
//    * standards groups add new tags to HTML.
//    *
//    * You can use any hyphen-separated name with the exception of:
//    *
//    * - annotation-xml
//    * - color-profile
//    * - font-face
//    * - font-face-src
//    * - font-face-uri
//    * - font-face-format
//    * - font-face-name
//    * - missing-glyph
//    */
//   selector: FragmentSelector;
//   /**
//    * The shadow root mode to use in the web component (Defaults to `open`).
//    */
//   shadowMode?: ShadowRootMode;
//   /**
//    * The wrapper element to use for the fragment. If not specified, the wrapper will be the same as
//    * the selector.
//    */
//   wrapper?: 'none' | keyof HTMLElementTagNameMap;
//   /**
//    * Object with the default values for the attributes to use in the fragment.
//    */
//   attributes?: ConfigAttributes<Attrs>;
//   /**
//    * The content to render in the fragment.
//    */
//   content: FragmentContent<Attrs>;
//   /**
//    * Default fallback to use when the fragment's content is a promise and is pending to resolve.
//    * This is useful to render a loading state.
//    *
//    * If not specified, the fragment will not render anything until the promise is resolved.
//    */
//   fallback?: (readOnlyProps: ReadOnlyAttributes<Attrs, ''>) => FragmentElement | FragmentElement[];
//   /**
//    * Default error boundary to use when the fragment's content throws an error.
//    */
//   errorBoundary?: {
//     /**
//      * The fallback to render when the fragment's content throws an error.
//      */
//     fallback: (error: Error) => FragmentElement | FragmentElement[];
//     /**
//      * Callback to execute when the fragment's content throws an error.
//      */
//     onError?: (error: Error) => void;
//     /**
//      * Callback to execute when the fragment's content throws an error and the error is caught.
//      * This callback is useful to reset the state of the fragment.
//      */
//     onReset?: (details: {
//       /**
//        * The reason why the error was caught.
//        * - `error` - The error was caught because the fragment's content threw an error.
//        * - `unmount` - The error was caught because the fragment was unmounted.
//        * - `update` - The error was caught because the fragment was updated.
//        * - `attribute` - The error was caught because the fragment's attribute changed.
//        * - `computed` - The error was caught because the fragment's computed attribute changed.
//        * - `slot` - The error was caught because the fragment's slot changed.
//        * - `content` - The error was caught because the fragment's content changed.
//        * - `unknown` - The error was caught because the reason is unknown.
//        * - `other` - The error was caught because the reason is not listed.
//        * - `custom` - The error was caught because the reason is custom.
//        * - `none` - The error was caught because the reason is not specified.
//        */
//       reason:
//         | 'error'
//         | 'unmount'
//         | 'update'
//         | 'attribute'
//         | 'computed'
//         | 'slot'
//         | 'content'
//         | 'unknown'
//         | 'other'
//         | 'custom'
//         | 'none';
//     }) => void;
//   };
//   /**
//    * API to customize the host element.
//    */
//   host?: (props: ReadOnlyAttributes<Attrs, ''>) => {
//     class: string;
//     style: string;
//   };
// };
