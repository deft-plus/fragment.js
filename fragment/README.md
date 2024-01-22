# Module `fragment`

This module contains all the main dependencies for the Fragment.js framework.

## Temp ideas

These are some ideas of how the framework will work. Hopefully.

## Notes

- When compiled, this needs to create all of the html to be serve and a single API serving all of
  the pages.

### Basic setup.

```tsx
import { fragment } from '@fragment.js';

// The `fragment` function allows you to create a custom element.
// To use this function, you need to specify the `name`,
// which is the tag name you want to assign to the custom element.
// Additionally, you provide the `content` that will be placed
// inside the element's shadowDOM.
//
// After defining the custom element, the fragment function returns
// another function. When you call this returned function, it
// generates a template for the custom element using the `html` tag
// literal.
const Element = fragment({
  name: 'app-element',
  content: () => <div>Hello World</div>,
});

// Then use it like:
<Element />;
```

### Change Shadow DOM.

```tsx
import { fragment } from '@fragment.js';

const Element = fragment({
  name: 'app-element',
  // You can define the shadow DOM mode with the `shadowMode`
  // option (Defaults to `open`).
  shadowMode: 'closed',
  content: () => <div>Hello World</div>,
});

// Then use it like:
<Element />;
```

### Different wrapper tag.

```tsx
import { fragment } from '@fragment.js';

const Element = fragment({
  name: 'app-element',
  // By default, the fragment is wrapped using the `name`.
  // However, you can use any HTML/SVG tag or choose `none` to
  // avoid wrapping the fragment. This will also make the fragment
  // not a web component.
  wrapper: 'div',
  content: () => <div>Hello World</div>,
});

// Then use it like:
<Element />;
```

### Adding attributes.

```tsx
import { fragment } from '@fragment.js';

// To define the attributes, you need to create a type that lists
// all the required attributes. It's important to note that
// attributes can only be of a primitive type (string, boolean,
// number, or undefined).
//
// When a property value is assigned as a primitive type, the
// library automatically creates a writable signal with a default
// value as an `AttributeDescriptor`.
//
// The library ensures the protection of the value type, and proper
// conversion is performed when a new value is set for the property.
//
// As a note, the return function of the fragment will have the
// same type as the attributes to be able to passed down.
type ElementAttrs = {
  hello: string;
};

const Element = fragment<ElementAttrs>({
  name: 'app-element',
  attributes: {
    // Optionally you can provide a default value for the attribute.
    // This will be the value used when the fragment is called
    // without attributes.
    hello: '',
  },
  content: ({ hello }) => {
    // You can update the value of the attribute using the `set`,
    // `update` or `mutate` methods. When you do this will update
    // the html with the new value as well call any subscribers to
    // the attribute.

    // Updates the html to `<app-element hello="world"></app-element>`
    // hello.set('world');

    return <div>Hello is: {hello()}</div>;
  },
});

// Prop `hello` is required to be passed down here and in the custom
// element tag if using directly in the browser.
<Element hello='world' />;
```

### Adding computed attributes

```tsx
import { fragment } from '@fragment.js';

// To declare a computed attribute, you need to pass a function as
// the attribute's value. The return type of the function will be
// the type of the computed value.
//
// By default the computed attribute will be a readonly signal and
// at runtime will have the other attributes as arguments. Here you
// don't need to specify the type of the arguments since the library
// will infer them.
type ElementAttrs = {
  hello: string;
  world: () => string;
};

const Element = fragment<ElementAttrs>({
  name: 'app-element',
  attributes: {
    hello: '',
    // Computed attributes use signals to subscribe to changes in
    // the attributes. This allows fine grained control over when
    // the computed attribute should be recomputed.
    //
    // Keep in mind that computed attributes can access to all of
    // primitive attributes and only the computed attributes that
    // are defined before (Object keys order). This avoids the
    // circular dependency problem.
    world: ({ hello }) => hello().toLowerCase(),
  },
  content: ({ world }) => {
    // You cannot change the value of a computed attribute.
    // Methods `set`, `update` and `mutate` are disabled.
    // world.set(''); // Will error.

    return <div>World is: {world()}</div>;
  },
});

// Prop `world` is not available to be passed down here nor in
// the custom element tag (in jsx env will error out, in browser
// will be ignored).
<Element hello='world' />;
```

### Updating attributes

```tsx
import { fragment } from '@fragment.js';

type CounterAttrs = {
  count: number;
};

const Counter = fragment<CounterAttrs>({
  name: 'app-counter',
  attributes: {
    count: 0,
  },
  content: ({ count }) => {
    const increment = () => count.update((value) => value + 1);
    const decrement = () => count.update((value) => value - 1);

    return (
      <div>
        <button onClick={increment}>Increment</button>
        {count()}
        <button onClick={decrement}>Decrement</button>
      </div>
    );
  },
});

// Then use it like:
<Counter count={0} />;
// On increment changes to: `<app-element count="1"></app-element>`
// in the browser.
```

### Adding internal state

```tsx
import { fragment, signal } from '@fragment.js';

// This feature is not limited to use within fragments only; it
// functions the same way when used outside of fragments as well,
// but on a global scale. However, if you require the use of a
// global state, it is advisable to utilize stores instead.
// const count = signal(0);

const Counter = fragment({
  name: 'app-counter',
  content: () => {
    // Signal will not create an attribute and can use any
    // structure like an object.
    const count = signal(0);

    const increment = () => count.update((value) => value + 1);
    const decrement = () => count.update((value) => value - 1);

    return (
      <div>
        <button onClick={increment}>Increment</button>
        {count()}
        <button onClick={decrement}>Decrement</button>
      </div>
    );
  },
});

// Then use it like:
<Counter />;
```

### Adding global state

```tsx
import { fragment, store } from '@fragment.js';

type CounterStore = {
  count: number;
  increment: () => void;
  decrement: () => void;
};

// Stores are a way to manage state in a more complex way. Each
// value you define in the store can be accessed by any fragment.
// This is useful for managing global state. By design, stores are
// immutable from the outside.
//
// To modify the state of the properties, you can make use of the
// `get` parameter that is provided to the store.. This allows for
// better performance and more predictable behavior.
const counterStore = store<CountStore>((get) => ({
  count: 0,
  increment: () => get().count.update((count) => count + 1),
  decrement: () => get().count.update((count) => count - 1),
}));

const Counter = createFragment({
  name: 'app-counter',
  content: () => {
    // These are readonly signals.
    const { count, increment, decrement } = counterStore();

    return (
      <div>
        <button onClick={increment}>Increment</button>
        {count()}
        <button onClick={decrement}>Decrement</button>
      </div>
    );
  },
});

// Then use it like:
<Counter />;
```

### Adding effects

```tsx
import { effect, fragment, store } from '@fragment.js';

type ElementStore = {
  text: string;
  update: (text: string) => void;
};

const elementStore = store<ElementStore>((get) => ({
  text: 0,
  update: (text: string) => get().text.update(text),
}));

type ElementAttrs = {
  hello: string;
};

const Element = fragment<ElementAttrs>({
  name: 'app-element',
  attributes: {
    hello: '',
  },
  content: ({ hello }) => {
    const { update: updateStoreText, text: storeText } = elementStore();

    // Effects always run at least once. When an effect runs, it
    // tracks any signal value reads. Whenever any of these signal
    // values change, the effect runs again. Similar to computed
    // signals, effects keep track of their dependencies
    // dynamically, and only track signals which were read in the
    // most recent execution.
    effect(() => {
      // This keeps in sync the `hello` attribute with the store.
      updateStoreText(hello());
    });

    return (
      <div>
        <input value={hello()} onInput={(e) => hello.set(e.target.value)} />
        <div>Attribute value: {hello()}</div>
        <div>Store value: {storeText()}</div>
        <button onClick={() => hello.set('')}>clear</button>
      </div>
    );
  },
});

// Then use it like:
<Element hello='world' />;
```

### Adding slots/children

```tsx
import { fragment } from '@fragment.js';

// The framework uses the native `slot` tag to render the content
// if the fragment is web component. If the fragment is not
// a web component you can also use the children prop.
const ElementWC = fragment({
  name: 'app-element',
  content: () => (
    <div>
      This is the slot content:
      <slot />
    </div>
  ),
});

// Then use it like:
<ElementWC>From slot</ElementWC>;

// With children

const Element = fragment({
  name: 'app-element',
  // This makes the fragment not to be wrapped and
  // therefore not a web component.
  wrapper: 'none',
  content: ({ children }) => (
    <div>
      This is the slot content:
      {children}
    </div>
  ),
});

// Then use it like:
<Element>From children</Element>;

// You could also use named slots.

const ElementNamed = fragment({
  name: 'app-element-named',
  content: () => (
    <div>
      This is the slot content:
      <slot name='child' />
    </div>
  ),
});

// Then use it like:
<ElementNamed>
  <div slot='child'>Will be rendered</div>
  <div>Will not be rendered</div>
</ElementNamed>;
```

### Adding styles

```tsx
import { fragment, styled } from '@fragment.js';

// The `styled` function generates a style tag and assigns a random
// name to each class defined within it. It returns both the style
// tag, which can be placed anywhere in your code, and the randomly
// generated class names for further reference. In the provided
// example, the nameForTheStyle class is defined with the CSS
// properties color: 'red' and fontSize: '20px'.
const [GlobalStyles, globalStyles] = styled()({
  nameForTheStyle: {
    color: 'red',
    fontSize: '20px',
  },
});

const Element = createFragment({
  name: 'app-element',
  content: () => {
    // You could also scope the styles to the fragment (By just
    // creating it in the same file or in the fragment itself).
    const [ScopedStyles, scopedStyles] = styled()({
      div: {
        color: 'red',
        fontSize: '20px',
      },
    });

    return (
      <>
        <GlobalStyles />
        <ScopedStyles />
        <div className={scopedStyles.div}>Hello world (scoped)</div>
        <div className={globalStyles.nameForTheStyle}>Hello world (global)</div>
      </>
    );
  },
});

// You could also create components with styles (like styled-components).

type ButtonAttrs = { color: string, fontSize: string };

const Button = styled('button', {
  name: 'styled-button',
})<ButtonAttrs>({
  color: 'red',
  fontSize: '20px',
});

// Or create a web component with styles based off a fragment.

const AppButton = styled(Button, {
  name: 'app-button',
})({
  color: 'red',
  fontSize: '20px',
});

// You can also acccess the attributes passed down to the fragment

const AppButton2 = styled(Button, {
  name: 'app-button-2',
})<ButtonAttrs>(({ color, fontSize }) => ({
  color,
  fontSize,
}));

// Or with the previous API
const [StylesFragment, styleNames] = styled()({
  nameForTheStyle: ({ color, fontSize }: ButtonAttrs) => {
    color,
    fontSize,
  },
});

styleNames.nameForTheStyle({ color: 'red', fontSize: '20px' });

// Nesting is also supported

const [StylesFragment, styleNames] = styled()({
  nameForTheStyle: {
    color: 'red',
    fontSize: '20px',

    [styled.expresion('&:hover')]: {
      color: 'blue',
    },
  },
});
```

### Accessing the host element

```tsx
import { classMap, effect, fragment, styleMap } from '@fragment.js';

// The `classMap` function uses the element.classList API to
// efficiently add and remove classes to an element based on an
// object passed by the user.
const classNames = classMap({
  'class-1': true,
  'class-2': false,
});

// The `styleMap` function uses the element.style API to
// efficiently add and remove inline styles to an element based
// on an object passed by the user.
const inlineStyle = styleMap({
  color: 'red',
  fontSize: '20px',
});

const Element = createFragment({
  name: 'app-element',
  content: ({ host }) => {
    // You can use the imperative API to add attributes directly.
    effect(() => {
      host.classList.add(classNames());
      host.style = inlineStyle();
    });

    // Or you can use the declarative API.
    host(() => ({
      class: classNames,
      style: inlineStyle,
    }));

    return <div>Hello world</div>;
  },
});
```

### Adding routing

```tsx
import { Link, routing } from '@fragment.js';
import { About } from './views/about.ts';
import { Contact } from './views/contact.ts';
import { NotFound } from './views/not-found.ts';

export const [router, AppRouterOutlet] = routing({
  name: 'app-router-outlet',
  routes: [
    {
      path: 'about',
      fragment: About,
    },
    {
      path: 'contact',
      fragment: Contact,
    },
    {
      path: '**',
      fragment: NotFound,
    },
  ],
});

// Then use it like:
<AppRouterOutlet />;

// Then you can use the `push` method to navigate to a route.
router.push('/about');

// Or you can use the `push` method to navigate to a route with params.
router.push('/contact', { id: 1 });

// Or you can use the `Link` fragment to get the link to a route.
<Link href='/about'>About</Link>;
```
