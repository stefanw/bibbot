import { rollup } from 'rollup'

import config from '../rollup.userscript.config.mjs'

async function build() {
  const bundle = await rollup(config)
  try {
    await bundle.write(config.output)
  } finally {
    await bundle.close()
  }
}

try {
  await build()
  // The isolated TypeScript plugin keeps an idle handle after Rollup has
  // written and closed the bundle. All build work is complete at this point.
  process.exit(0)
} catch (error) {
  console.error(error)
  process.exit(1)
}
