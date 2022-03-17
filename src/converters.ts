export default {
  preToParagraph: (htmlArr: string[]) => {
    return htmlArr.map((html) => {
      html = html.replace(/<pre[^>]+>/, '').replace(/<\/pre>/, '')
      // Remove ems (highlighting query)
      html = html.replace(/<em class="hlt1">/g, '').replace(/<\/em>/g, '')
      // Funny use of /// and // . for interviews for handelsblatt.com
      html = html.replace(/\/\/\//g, '\n\n<em>')
      html = html.replace(/\s+\/\/\s+\./g, '</em>\n\n')

      const doubleBreakCount = (html.match(/\n\n/g) || []).length
      let paragrahBreak = '\n\n'
      if (doubleBreakCount < 2) {
        paragrahBreak = '\n'
      }

      const parts = html.split(paragrahBreak)
      let content = `<p>${parts.join('</p><p>')}</p>`
      // Replace empty paragraphs
      content = content.replace(/<p><\/p>/g, '')
      return content
    })
  }
}
