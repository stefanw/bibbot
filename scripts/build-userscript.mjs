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
  // @rollup/plugin-typescript leaves an idle handle open with this isolated
  // target. All bundle writes and close hooks have completed at this point.
  process.exit(0)
} catch (error) {
  console.error(error)
  process.exit(1)
}
