import { defineConfig } from 'tsup';

export default defineConfig((options) => {
  return {
    name: 'remark-nomnoml',

    shims: true,
    format: ['cjs', 'esm'],

    entry: ['src/remark-nomnoml.ts'],

    minify: !options.watch,
    splitting: false,
    sourcemap: true,
    clean: true,
  };
});
