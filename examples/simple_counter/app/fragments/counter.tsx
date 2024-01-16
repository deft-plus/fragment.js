import { fragment, signal } from '@fragment.js';

export const Counter = fragment({
  name: 'app-counter',
  content: () => {
    const counter = signal(0);

    return (
      <div>
        <p>Counter: {counter}</p>
        <button onClick={() => counter.update((v) => v + 1)}>Increment</button>
        <button onClick={() => counter.update((v) => v - 1)}>Decrement</button>
      </div>
    );
  },
});
