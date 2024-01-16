// import { describe, it } from '@app_deps_testing.ts';
// import { fragment, T } from './create_fragment.js';

// type MyAttributes = {
//   firstName: T.Attribute<string>;
//   lastName: T.Attribute<string>;
//   age: T.Attribute<number>;
//   isCool: T.Attribute<boolean>;
//   displayName: T.Computed<string>;
//   birth: T.Computed<number>;
//   hasCoolness: T.Computed<boolean>;
// };

// describe('createFragment()', () => {
//   it({
//     name: 'should pass',
//     ignore: true, // TODO(@miguelbogota): Implement createFragment and fix testing.
//     fn: () => {
//       const element = fragment<MyAttributes>({
//         selector: 'my-element',
//         attributes: {
//           firstName: 'Jane',
//           lastName: 'Doe',
//           age: 42,
//           isCool: true,
//           displayName: ({ firstName, lastName }) => `${firstName()} ${lastName()}`,
//           birth: ({ age }) => Date.now() - age() * 365 * 24 * 60 * 60 * 1000,
//           hasCoolness: ({ isCool }) => isCool(),
//         },
//         content: async ({ displayName, firstName }) => {
//           firstName.set('Something different');

//           return await new Promise(() => `This should've change ${displayName()}`);
//         },
//         fallback: ({ firstName, lastName }) => `Loading ${firstName()} ${lastName()}...`,
//         errorBoundary: {
//           fallback: ({ name }) => `Error loading ${name}`,
//           onError: (error) => console.error(error),
//           onReset: ({ reason }) => console.log(`Resetting because "${reason}"`),
//         },
//         host: ({ firstName, lastName }) => ({
//           class: 'my-element',
//           style: `--first-name: ${firstName()}; --last-name: ${lastName()};`,
//         }),
//       });

//       const e = element({ firstName: 'Jane', lastName: 'Doe', age: 42, isCool: true });

//       console.log(e);

//       // import '@app-core/create_fragment/types/mod.ts';
//       // Context augmentation.
//       // declare module '@app-core/create_fragment/types/mod.ts' {
//       //   type FragmentContext = {
//       //     hello: string;
//       //   };
//       // }
//     },
//   });
// });
