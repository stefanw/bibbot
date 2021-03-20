export default [
  {
    input: 'src/background.js',
    output: {
      file: 'build/background.js',
      format: 'cjs'
    }
  },
  {
    input: 'src/content.js',
    output: {
      file: 'build/content.js',
      format: 'cjs'
    }
  },
  {
    input: 'src/options.js',
    output: {
      file: 'build/options.js',
      format: 'cjs'
    }
  }
]
