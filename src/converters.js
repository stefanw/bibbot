export default {
  preToParagraph: function (htmlArr) {
    return htmlArr.map(function (html) {
      html = html.replace(/<pre[^>]+>/, '').replace(/<\/pre>/, '')
      html = html.replace(/<em class="hlt1">/g, '').replace(/<\/em>/g, '')
      // Funny use of /// and // . for interviews for handelsblatt.com
      html = html.replace(/\/\/\//g, '\n\n<em>')
      html = html.replace(/\s+\/\/\s+\./g, '</em>\n\n')

      const parts = html.split('\n\n')
      return `<p>${parts.join('</p><p>')}</p>`
    })
  }
}
