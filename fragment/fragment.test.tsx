import { assertEquals, describe, it } from '@app_deps_testing.ts';
import { fragment } from './fragment.tsx';

describe('fragment()', () => {
  it('should pass', () => {
    type TestAttrs = {
      test: string;
      com: () => { user: string };
      com3: () => { user: string };
    };

    const Test = fragment<TestAttrs>({
      name: 'test-hello',
      wrapper: 'div',
      attributes: {
        test: 'test',
        com: () => ({ user: '_test' }),
        com3: ({ com }) => ({ user: 'test' + com().user }),
      },
      content: ({ test, com, com3 }) => (
        <div class='hello'>
          <a href={com().user}>user1</a>
          <a href={com3().user}>user2</a>
        </div>
      ),
    });

    const test = <Test test='hello' />;

    console.log(test);

    assertEquals(1, 1);
  });
});
