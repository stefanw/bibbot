import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'

export default [
  {
    input: 'src/background.ts',
    output: {
      file: 'build/background.js',
      format: 'cjs'
    },
    plugins: [commonjs(), nodeResolve(), typescript()]
  },
  {
    input: 'src/content.ts',
    output: {
      file: 'build/content.js',
      format: 'cjs'
    },
    plugins: [commonjs(), nodeResolve(), typescript()]
  },
  {
    input: 'src/options.ts',
    output: {
      file: 'build/options.js',
      format: 'cjs'
    },
    plugins: [commonjs(), nodeResolve(), typescript()]
  },
  {
    input: 'src/popup.ts',
    output: {
      file: 'build/popup.js',
      format: 'cjs'
    },
    plugins: [commonjs(), nodeResolve(), typescript()]
  },
  {
    input: 'tests/content_test.ts',
    output: {
      file: 'test_build/content_test.js',
      format: 'cjs'
    },
    plugins: [commonjs(), nodeResolve(), typescript()]
  },
  {
    input: 'tests/sites.test.ts',
    output: {
      file: 'test_build/sites.test.js',
      format: 'cjs'
    },
    plugins: [commonjs(), nodeResolve(), typescript()]
  }
]
