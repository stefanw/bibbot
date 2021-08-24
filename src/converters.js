export default {
  preToParagraph: function (htmlArr) {
    return htmlArr.map(function (html) {
      html = html.replace(/<pre[^>]+>/, '').replace(/<\/pre>/, '')
      // Remove ems (highlighting query)
      html = html.replace(/<em class="hlt1">/g, '').replace(/<\/em>/g, '')
      // Funny use of /// and // . for interviews for handelsblatt.com
      html = html.replace(/\/\/\//g, '\n\n<em>')
      html = html.replace(/\s+\/\/\s+\./g, '</em>\n\n')

      const doubleBreakCount = (html.match(/\\n\\n/g) || []).length
      let paragrahBreak = '\n\n'
      if (doubleBreakCount < 2) {
        paragrahBreak = '\n'
      }

      const parts = html.split(paragrahBreak)
      return `<p>${parts.join('</p><p>')}</p>`
    })
  }
}
