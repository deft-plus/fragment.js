import { assertEquals, describe, it } from '@app_deps_testing.ts';
import { classMap } from './class_map.ts';
import { signal } from '../signal/mod.ts';

describe('classMap()', () => {
  it('should return empty string for empty object', () => {
    const classNames = classMap({});
    assertEquals(classNames(), '');
  });

  it('should return empty string for object with all false values', () => {
    const classNames = classMap({
      foo: false,
      bar: false,
    });
    assertEquals(classNames(), '');
  });

  it('should return single class for object with single true value', () => {
    const classNames = classMap({
      foo: true,
    });
    assertEquals(classNames(), 'foo');
  });

  it('should not return class for null or undefined values', () => {
    const classNames = classMap({
      foo: null,
      bar: undefined,
    });
    assertEquals(classNames(), '');

    const classNames2 = classMap({
      foo: null,
      bar: undefined,
      baz: true,
    });
    assertEquals(classNames2(), 'baz');
  });

  it('should return multiple classes for object with multiple true values', () => {
    const classNames = classMap({
      foo: true,
      bar: true,
    });
    assertEquals(classNames(), 'foo bar');

    const classNames2 = classMap({
      foo: true,
      bar: true,
      baz: false,
    });
    assertEquals(classNames2(), 'foo bar');
  });

  it('should validate falsy string and number values', () => {
    const classNames = classMap({
      foo: '',
      bar: 0,
    });
    assertEquals(classNames(), '');

    const classNames2 = classMap({
      foo: '',
      bar: 0,
      234: 2,
      baz: true,
      hello: 'world',
    });
    assertEquals(classNames2(), '234 baz hello');
  });

  it('should allow to keep track of signals as well', () => {
    const truthySignal = signal('hello');
    const falsySignal = signal(0);

    const classNames = classMap({
      foo: '',
      bar: truthySignal,
      baz: falsySignal,
    });

    assertEquals(classNames(), 'bar');

    truthySignal.set('');
    assertEquals(classNames(), '');

    falsySignal.set(1);
    assertEquals(classNames(), 'baz');
  });

  it('should allow to pass computed signals', () => {
    const truthySignal = signal('hello');
    const falsySignal = signal(0);

    const classNames = classMap({
      foo: '',
      bar: () => truthySignal(),
      baz: () => falsySignal(),
    });

    assertEquals(classNames(), 'bar');

    truthySignal.set('');
    assertEquals(classNames(), '');

    falsySignal.set(1);
    assertEquals(classNames(), 'baz');
  });

  it('should allow to group class names', () => {
    const classNames = classMap.group({
      foo: {
        bar: true,
        baz: false,
      },
      hello: {
        world: true,
      },
    });

    assertEquals(classNames.foo(), 'bar');
    assertEquals(classNames.hello(), 'world');
  });

  it('should allow to pass signals to a grouped class name', () => {
    const truthySignal = signal('hello');
    const falsySignal = signal(0);

    const classNames = classMap.group({
      foo: {
        bar: truthySignal,
        baz: falsySignal,
      },
    });

    assertEquals(classNames.foo(), 'bar');

    truthySignal.set('');
    assertEquals(classNames.foo(), '');

    falsySignal.set(1);
    assertEquals(classNames.foo(), 'baz');
  });

  it('should allow to pass computed signals to a grouped class name', () => {
    const truthySignal = signal('hello');
    const falsySignal = signal(0);

    const classNames = classMap.group({
      foo: {
        bar: () => truthySignal(),
        baz: () => falsySignal(),
      },
    });

    assertEquals(classNames.foo(), 'bar');

    truthySignal.set('');
    assertEquals(classNames.foo(), '');

    falsySignal.set(1);
    assertEquals(classNames.foo(), 'baz');
  });
});
