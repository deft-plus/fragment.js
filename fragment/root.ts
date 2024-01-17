export type RootOptions = {
  target: HTMLElement;
  plugins: unknown[];
};

export function root(options: RootOptions) {
  const { target } = options;

  console.log('Root created', target);

  return {
    mount(fragment: JSX.Element) {
      console.log('Root mounted', fragment);
    },
  };
}
