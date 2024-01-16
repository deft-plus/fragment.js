# Module `directives`

Directives are a collection of versatile utility functions designed to seamlessly enhance the
capabilities of the framework in a modular fashion.

## Directives

### `classMap`

`classMap` is a highly useful directive that facilitates the generation of a string representation
based on the given class information. It is especially usefull when you need to conditionally
construct a string containing class names.

Simply provide an object with class names as keys and the corresponding conditions as values.

```ts
const className = classMap({ foo: bar });
// The result of className() will be 'foo' if bar is truthy.
```

You can use signals and computed signals just like you would use values when supplying arguments to
the `classMap` directive.

```ts
const bar = signal('bar');

const className = classMap({ foo: bar });
// The result of className() will be 'foo' since bar is truthy.
```

```ts
const bar = signal('bar');
const baz = () => bar();

const className = classMap({ foo: baz });
// The result of className() will be 'foo' since bar is truthy.
```

#### Grouping into a single namespace

In certain scenarios, it is very good idea to group the class names and use a namespace to get the
needed class name. This directive offers a straightforward method to achieve this using the `group`
method. This function allows you to group the class names into a single namespace.

```ts
const classNames = classMap.group({
  foo: {
    bar: true,
    baz: false,
  },
  hello: {
    world: true,
  },
});

// classNames.foo() returns 'bar' since baz is falsy.
// classNames.hello() returns 'world' since it is truthy.
```

This is very useful when you have a component with multiple child component with very dynamic class
names and want to group them together to avoid nest the `classMap` function multiple times.
