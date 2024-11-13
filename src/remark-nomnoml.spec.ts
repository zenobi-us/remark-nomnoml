import { expect, test } from 'vitest';
import { remark } from 'remark';
import { VFile } from 'vfile';

import { remarkNomnoml } from './remark-nomnoml';

test.each([
  {
    name: 'simple',
    wordsToSearch: ['Decorator pattern', 'Component', 'operation()'],
    diagram:
      '```nomnoml\n[<frame>Decorator pattern|Component||+ operation()]\n```',
  },
  {
    name: 'simple with error',
    diagram: '```nomnoml\n ] >```\n',
    wordsToSearch: [],
    invalid: true,
  },
  {
    name: 'class diagram',
    wordsToSearch: ['Decorator pattern', 'Component', 'operation()'],
    diagram:
      '```nomnoml\n[<frame>Decorator pattern|Component||+ operation()]\n```',
  },
])(
  'render nomnoml diagram: $name',
  async ({ diagram, invalid, wordsToSearch }) => {
    const processor = remark();
    processor.use(remarkNomnoml);

    const file = new VFile(diagram);

    if (invalid) {
      await expect(() => {
        return processor.process(file);
      }).rejects.toThrow();
      return;
    }

    expect(file.messages).toHaveLength(0);

    await processor.process(file);

    expect(file.messages).toHaveLength(0);

    for (const word of wordsToSearch) {
      expect(file.toString()).toContain(word);
    }
  },
);

test('it should throw a vfile error if a diagram is invalid without error fallback', async () => {
  const processor = remark().use(remarkNomnoml);

  const file = new VFile('```nomnoml\n ] >```\n');
  expect(file.messages).toHaveLength(0);

  await expect(() => processor.process(file)).rejects.toThrow();

  expect(file.messages).toHaveLength(1);
  expect(file.messages[0].message).toBe(
    'Parse error at line 1 column 1, expected "end of file" but got "]"',
  );
  expect(file.messages[0].source).toBe('remark-nomnoml');
  expect(file.messages[0].ruleId).toBe('remark-nomnoml');
  expect(file.messages[0].fatal).toBe(true);
  expect(file.messages[0].place).toStrictEqual({
    start: { offset: 0, line: 1, column: 1 },
    end: { offset: 19, line: 3, column: 1 },
  });
});

test('it should not a vfile error if a diagram is invalid with an error fallback', async () => {
  const processor = remark().use(remarkNomnoml, {
    errorFallback: (node, error) => {
      return {
        type: 'paragraph',
        children: [{ type: 'text', value: `Error: ${error}` }],
      };
    },
  });

  const file = new VFile('```nomnoml\n ] >```\n');
  expect(file.messages).toHaveLength(0);

  await expect(() => processor.process(file)).toBeDefined();

  expect(file.messages).toHaveLength(0);
});
