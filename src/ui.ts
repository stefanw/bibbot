export const COLOR = '#029d74'
export const ICON = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2072%2072%22%3E%3Cstyle%3E%3C%21%5BCDATA%5B.B%7Bstroke-linejoin%3Around%7D.C%7Bstroke-width%3A1.954%7D.D%7Bfill%3A%23029d74%7D.E%7Bstroke%3A%23029d74%7D%5D%5D%3E%3C/style%3E%3Cpath%20d%3D%22M51.2%2067.839c.2%200%20.4-.2.4-.4v-1.3c0-.2-.2-.4-.4-.4H15.9c-.2%200-.4-.2-.4-.4v-36.2c0-.1.1-.3.3-.4.2%200%2037.2-6.4%2040.5-7.6.1-.1.2%200%20.2.2v38.753c0%20.3.2.5.4.5h1.2a.47.47%200%200%200%20.5-.5V18.339c0-.2-.1-.3-.4-.2-4.1%201.6-44.5%209.2-44.5%209.2-.2.1-.3.2-.3.4v39.6c0%20.2.2.411.4.4h37.4z%22%20class%3D%22D%22/%3E%3Cg%20fill%3D%22none%22%20class%3D%22E%22%3E%3Cpath%20d%3D%22M19.958%2049.862h32.13v10.463h-32.13z%22%20class%3D%22B%20C%22/%3E%3Cpath%20d%3D%22M23.006%2052.876v4.756zm2.604%200v4.756zm2.603%200v4.756zm2.603%200v4.756zm2.604%200v4.756zm2.603%200v4.756zm2.604%200v4.756zm2.603%200v4.756zm2.604%200v4.756zm2.603%200v4.756zm2.604%200v4.756z%22%20stroke-width%3D%221.002%22/%3E%3Ccircle%20cx%3D%2226.982%22%20cy%3D%2237.291%22%20r%3D%224.518%22%20class%3D%22B%20C%22/%3E%3C/g%3E%3Cpath%20d%3D%22M28.843%2037.422a1.94%201.94%200%201%201-3.882.026%201.94%201.94%200%201%201%203.881-.079%22%20class%3D%22D%22/%3E%3Cellipse%20cx%3D%2245.018%22%20cy%3D%2237.291%22%20rx%3D%224.517%22%20ry%3D%224.518%22%20fill%3D%22none%22%20class%3D%22B%20C%20E%22/%3E%3Cpath%20d%3D%22M46.88%2037.422a1.94%201.94%200%201%201-3.882.026%201.94%201.94%200%201%201%203.881-.079%22%20class%3D%22D%22/%3E%3Cg%20transform%3D%22rotate%28349.739%2037.884%20157.84%29%22%20fill%3D%22none%22%20class%3D%22E%22%3E%3Ccircle%20cx%3D%2259.093%22%20cy%3D%2213.372%22%20r%3D%224.518%22%20class%3D%22B%20C%22/%3E%3Cpath%20d%3D%22M59.093%2025.018v-2.547-5.432z%22%20stroke-width%3D%222.891%22/%3E%3C/g%3E%3C/svg%3E'
export const MESSAGE_ID = 'bibbot-message'
export const BOT_ID = 'bibbot-loader'
export const LOADER_ID = 'bibbot-loading'

export const LOADER_HTML = `
<style>
#${LOADER_ID} {
  position:absolute;
  left: 50%;
  top: 50%;
  animation: bibbot-working 2s ease-in-out 0s infinite;
}

@keyframes bibbot-working {
  0% {
    transform: translate(-60px, 0) rotateY(180deg);
  }
  40% {
    transform: translate(60px, 0) rotateY(180deg) ;
  }
  50% {
    transform: translate(60px, 0) rotateY(0deg) ;
  }
  90% {
    transform: translate(-60px, 0) rotateY(0deg);
  }
  100% {
    transform: translate(-60px, 0) rotateY(180deg);
  }
}
</style>
<div id="${BOT_ID}" style="border: 5px solid ${COLOR}; padding: 10px 10px 60px; margin: 20px auto; text-align:center; position:relative;">
  <div style="color: ${COLOR}; font-family: sans-serif; font-size: 1.2rem">BibBot</div>
  <img id="bibbot-loading" src="${ICON}" alt="BibBot" height="40" width="30">
  <div id="${MESSAGE_ID}" style="font-family: sans-serif; font-size: 0.9rem; color: ${COLOR}">Pressedatenbank wird aufgerufen...</div>
</div>`

export const FAILED_HTML = `<strong>Artikel konnte nicht gefunden werden</strong>
<ul style="text-align:left;margin-left:1rem">
<li>Titel können sich von der Druckausgabe unterscheiden. Nutzen Sie das offene Tab um nach Stichworten zu suchen.</li>
<li>ggf. ist der Artikel online exklusiv oder das Medium nicht über Ihre Bibliothek verfügbar</li>
<li>Artikel aus der gedruckten Ausgabe sind ggf. erst später verfügbar.</li>
</ul>`
