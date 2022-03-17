import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'

export default [
  {
    input: 'src/background.ts',
    output: {
      file: 'build/background.js',
      format: 'cjs'
    },
    plugins: [nodeResolve(), typescript()]
  },
  {
    input: 'src/content.ts',
    output: {
      file: 'build/content.js',
      format: 'cjs'
    },
    plugins: [nodeResolve(), typescript()]
  },
  {
    input: 'src/options.ts',
    output: {
      file: 'build/options.js',
      format: 'cjs'
    },
    plugins: [nodeResolve(), typescript()]
  },
  {
    input: 'src/popup.ts',
    output: {
      file: 'build/popup.js',
      format: 'cjs'
    },
    plugins: [nodeResolve(), typescript()]
  }
  // {
  //   input: 'tests/content_test.js',
  //   output: {
  //     file: 'test_build/content_test.js',
  //     format: 'cjs'
  //   }
  // }
]
