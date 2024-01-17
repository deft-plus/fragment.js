import { assertEquals, describe, it } from '@app_deps_testing.ts';
import { fragment } from './fragment.tsx';

describe('fragment()', () => {
  it('should pass', () => {
    type TestAttrs = {
      test: string;
      com: () => { user: string };
    };

    const Test = fragment<TestAttrs>({
      name: 'test-hello',
      wrapper: 'div',
      attributes: {
        test: 'test',
        com: ({ test }) => {
          console.log(test);
          return { user: 'test' };
        },
      },
      content: () => <div>Test</div>,
    });

    const test = <Test test="asdasd" />;

    console.log(test);

    assertEquals(1, 1);
  });
});
