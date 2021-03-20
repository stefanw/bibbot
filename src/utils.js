const ident = (x) => x

function interpolate (str, params, prefix = '', converter = ident, fallback = '') {
  if (prefix.length > 0) {
    prefix = `${prefix}.`
  }
  for (const key in params) {
    str = str.replace(
      new RegExp(`{${prefix}${key}}`),
      converter(params[key] || fallback)
    )
  }
  return str
}

export {
  interpolate
}
