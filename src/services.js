import { COLOR } from './ui.js'
function escapeHTML (r) {
  // eslint-disable-next-line no-control-regex
  return r.replace(/[\x26\x0A<>'"]/g, function (r) { return '&#' + r.charCodeAt(0) + ';' })
}

const addSharingButton = (main, content, postUrl) => {
  const html = `<form id="bibbot-post-popup" method="POST" action="${postUrl}">
  <input type="hidden" name="title" value="${escapeHTML(document.title)}">
  <input type="hidden" name="url" value="${escapeHTML(document.location.href)}">
  <input type="hidden" name="content" value="${escapeHTML(content)}">
  <button type="submit" style="cursor: pointer; float:right; margin: 0.5em 1em; padding: 0.5em;background: ${COLOR};color:#fff">
    Später lesen
  </button>
  </form>`
  main.innerHTML = html + main.innerHTML
  window.setTimeout(function () {
    document.querySelector('#bibbot-post-popup').addEventListener('submit', function () {
      console.log('Opening in popup')
      window.open('', 'bibbot', 'width=600,height=400,resizeable,scrollbars')
      this.target = 'bibbot_postpopup'
    })
  }, 100)
}

export {
  addSharingButton
}
