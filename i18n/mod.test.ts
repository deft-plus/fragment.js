// import { assertEquals, assertThrows, describe, it } from '@app_deps_testing.ts';
// import { i18n } from './mod.ts';

// // Testing type for dynamic values.
// type DynamicValues = { name: string };

// describe('i18n()', () => {
//   it('should create i18n function with default values', () => {
//     const i18nFactory = i18n();

//     const useDefaultI18n = i18nFactory.create('default', () => ({
//       'test': () => [{ lang: 'en', value: 'test' }],
//     }));

//     const t = useDefaultI18n();

//     assertEquals(t['test'](), 'test');
//   });

//   it('should use the first language as default', () => {
//     const i18nFactory = i18n({ languages: ['es', 'en'] });

//     const useValidI18n = i18nFactory.create('default', () => ({
//       'test': () => [
//         { lang: 'es', value: 'test in Spanish' },
//         { lang: 'en', value: 'test' },
//       ],
//     }));

//     const t = useValidI18n();

//     assertEquals(t['test'](), 'test in Spanish');
//   });

//   it('should enforce the passed languages', () => {
//     const i18nFactory = i18n({ languages: ['en', 'es'] });

//     assertThrows(() =>
//       i18nFactory.create('error', () => ({
//         // @ts-expect-error language `es` is not added to test the error.
//         'test': () => [{ lang: 'en', value: 'test' }],
//       }))
//     );

//     const useValidI18n = i18nFactory.create('valid', () => ({
//       'test': () => [
//         { lang: 'en', value: 'test' },
//         { lang: 'es', value: 'test in Spanish' },
//       ],
//     }));

//     const t = useValidI18n();

//     assertEquals(t['test']({ lang: 'es' }), 'test in Spanish');
//   });

//   it('should return the right language with right priority', () => {
//     const i18nFactory = i18n({ languages: ['en', 'es'] });

//     const useValidI18n = i18nFactory.create('valid', () => ({
//       'test': () => [
//         { lang: 'en', value: 'test' },
//         { lang: 'es', value: 'test in Spanish' },
//       ],
//     }));

//     const tEnglish = useValidI18n();
//     const tSpanish = useValidI18n({ lang: 'es' });

//     assertEquals(tEnglish['test'](), 'test');
//     assertEquals(tSpanish['test'](), 'test in Spanish');

//     // Inline language should have priority.
//     assertEquals(tEnglish['test']({ lang: 'es' }), 'test in Spanish');
//     assertEquals(tSpanish['test']({ lang: 'en' }), 'test');
//   });

//   it('should allow to pass custom formatters', () => {
//     const formatters = {
//       random: (value: string) => `random ${value}`,
//     };

//     const i18nFactory = i18n({ formatters });

//     const useDefaultI18n = i18nFactory.create('default', (f) => ({
//       'test': () => [{ lang: 'en', value: f.random('test') }],
//     }));

//     const t = useDefaultI18n();

//     assertEquals(t['test'](), 'random test');
//   });

//   it('should allow to pass dynamic values at runtime', () => {
//     const i18nFactory = i18n();

//     const useDefaultI18n = i18nFactory.create('default', () => ({
//       'test': ({ name }: DynamicValues) => [{ lang: 'en', value: `My name is: ${name}` }],
//     }));

//     const t = useDefaultI18n();

//     // @ts-expect-error to test the error.
//     assertThrows(() => t['test']());
//     assertEquals(t['test']({ name: 'John Doe' }), 'My name is: John Doe');
//   });

//   it('should allow to use pluralization', () => {
//     const i18nFactory = i18n();

//     const useDefaultI18n = i18nFactory.create('default', () => ({
//       'tests': () => [
//         {
//           lang: 'en',
//           value: {
//             default: 'tests',
//             one: 'test',
//           },
//         },
//       ],
//       'tests with count': ({ count }: { count: number }) => [
//         {
//           lang: 'en',
//           value: {
//             default: `${count} tests`,
//             one: '1 test',
//             few: 'A few tests',
//           },
//         },
//       ],
//       'tests with more counts': ({ count }: { count: number }) => [
//         {
//           lang: 'en',
//           value: {
//             default: `${count} tests`,
//             zero: 'No tests',
//             one: '1 test',
//             two: '2 tests',
//             few: 'A few tests',
//             many: 'Many tests',
//             other: `${count} tests`,
//           },
//         },
//       ],
//     }));

//     const t = useDefaultI18n();

//     assertEquals(t['tests'](), 'tests');
//     assertEquals(t['tests']({ count: 1 }), 'test');
//     assertEquals(t['tests']({ count: 2 }), 'tests');

//     assertEquals(t['tests with count']({ count: 0 }), '0 tests');
//     assertEquals(t['tests with count']({ count: 1 }), '1 test');
//     assertEquals(t['tests with count']({ count: 2 }), '2 tests');
//     assertEquals(t['tests with count']({ count: 3 }), 'A few tests');

//     assertEquals(t['tests with more counts']({ count: 0 }), 'No tests');
//     assertEquals(t['tests with more counts']({ count: 1 }), '1 test');
//     assertEquals(t['tests with more counts']({ count: 2 }), '2 tests');
//     assertEquals(t['tests with more counts']({ count: 3 }), 'A few tests');
//     assertEquals(t['tests with more counts']({ count: 7 }), 'Many tests');
//     assertEquals(t['tests with more counts']({ count: 10 }), 'Many tests');
//     assertEquals(t['tests with more counts']({ count: 11 }), '11 tests');
//   });

//   it('should allow to merge different translations into one', () => {
//     const i18nFactory = i18n({ languages: ['en', 'es'] });

//     const useDefaultI81n = i18nFactory.create('default', () => ({
//       'Welcome to the page': () => [
//         { lang: 'en', value: 'Welcome to the page' },
//         { lang: 'es', value: 'Bienvenido a la página' },
//       ],
//       'Welcome to the page to': ({ name }: DynamicValues) => [
//         { lang: 'en', value: `Welcome to the page, hi ${name}!` },
//         { lang: 'es', value: `Bienvenido a la página, hola ${name}!` },
//       ],
//     }));

//     const useLoginI81n = i18nFactory.create('login', () => ({
//       'Welcome to': ({ name }: DynamicValues) => [
//         { lang: 'en', value: `Welcome ${name}` },
//         { lang: 'es', value: `Bienvenido ${name}` },
//       ],
//       'Items': () => [
//         { lang: 'en', value: { default: 'Items', one: 'Item' } },
//         { lang: 'es', value: { default: 'Artículos', one: 'Artículo' } },
//       ],
//       'Items count': ({ count }: { count: number }) => [
//         {
//           lang: 'en',
//           value: { default: `${count} Items`, one: `${count} Item`, zero: 'No Items' },
//         },
//         {
//           lang: 'es',
//           value: { default: `${count} Artículos`, one: `${count} Artículo`, zero: 'No Artículos' },
//         },
//       ],
//     }));

//     const useI18n = i18nFactory.merge([
//       useDefaultI81n,
//       useLoginI81n,
//     ]);

//     // Base.
//     const t1 = useI18n();
//     const text1 = [
//       t1['default.Welcome to the page'](),
//       t1['default.Welcome to the page to']({ name: 'John Doe' }),
//       t1['login.Welcome to']({ name: 'John Doe' }),
//       t1['default.Welcome to the page to']({ name: 'John Doe', lang: 'es' }),
//     ];

//     assertEquals(text1[0], 'Welcome to the page');
//     assertEquals(text1[1], 'Welcome to the page, hi John Doe!');
//     assertEquals(text1[2], 'Welcome John Doe');
//     assertEquals(text1[3], 'Bienvenido a la página, hola John Doe!');

//     // Default namespace.
//     const t2 = useI18n({ namespace: 'default' });
//     const text2 = [
//       t2['Welcome to the page'](),
//       t2['Welcome to the page to']({ name: 'John Doe' }),
//       t2['Welcome to the page']({ lang: 'es' }),
//     ];

//     assertEquals(text2[0], 'Welcome to the page');
//     assertEquals(text2[1], 'Welcome to the page, hi John Doe!');
//     assertEquals(text2[2], 'Bienvenido a la página');

//     // Default language.
//     const t3 = useI18n({ lang: 'es' });
//     const text3 = [
//       t3['default.Welcome to the page'](),
//       t3['default.Welcome to the page to']({ name: 'John Doe' }),
//       t3['login.Welcome to']({ name: 'John Doe' }),
//       t3['login.Welcome to']({ name: 'John Doe', lang: 'en' }),
//     ];

//     assertEquals(text3[0], 'Bienvenido a la página');
//     assertEquals(text3[1], 'Bienvenido a la página, hola John Doe!');
//     assertEquals(text3[2], 'Bienvenido John Doe');
//     assertEquals(text3[3], 'Welcome John Doe');

//     // Pluralization
//     const text4 = [
//       t1['login.Items'](),
//       t1['login.Items']({ count: 0 }),
//       t1['login.Items']({ count: 1 }),
//       t1['login.Items']({ count: 2 }),
//       t1['login.Items']({ count: 20 }),
//       t1['login.Items count']({ count: 0 }),
//       t1['login.Items count']({ count: 1 }),
//       t1['login.Items count']({ count: 2 }),
//       t1['login.Items count']({ count: 20 }),
//     ];

//     assertEquals(text4[0], 'Items');
//     assertEquals(text4[1], 'Items');
//     assertEquals(text4[2], 'Item');
//     assertEquals(text4[3], 'Items');
//     assertEquals(text4[4], 'Items');
//     assertEquals(text4[5], 'No Items');
//     assertEquals(text4[6], '1 Item');
//     assertEquals(text4[7], '2 Items');
//     assertEquals(text4[8], '20 Items');
//   });
// });
