const COLOR = '#00b6b5'
const ICON = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='15px' height='20px' version='1.1' viewBox='0 0 15 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='translate(-98.354 -138.46)'%3E%3Cpath d='m109.33 156.88c0.0529 0 0.10584-0.0529 0.10584-0.10584v-0.34395c0-0.0529-0.0529-0.10584-0.10584-0.10584h-8.8106c-0.0529 0-0.10584-0.0529-0.10584-0.10583v-9.5779c0-0.0265 0.0265-0.0794 0.0794-0.10583 0.0529 0 9.8425-3.81 10.716-4.1275 0.0265-0.0265 0.0529 0 0.0529 0.0529v3.4131c0 0.0794 0.0529 0.13229 0.10584 0.13229h0.3175c0.0794 0 0.13229-0.0529 0.13229-0.13229v-4.2069c0-0.0529-0.0265-0.0794-0.10584-0.0529-1.0848 0.42333-11.774 4.5508-11.774 4.5508-0.05292 0.0265-0.07937 0.0529-0.07937 0.10583v10.478c0 0.0529 0.053 0.10881 0.10583 0.10583h9.3662z' fill='%2300b6b5'/%3E%3Crect x='102.12' y='151.59' width='8.5012' height='2.7684' fill='none' stroke='%2300b6b5' stroke-linecap='square' stroke-linejoin='round' stroke-width='.517'/%3E%3Cg%3E%3Cg transform='matrix(.26458 0 0 .26458 90.021 135.28)' fill='none' stroke='%2300b6b5' stroke-width='1.0016'%3E%3Cpath d='m48.769 64.675v4.756z'/%3E%3Cpath d='m51.373 64.675v4.756z'/%3E%3Cpath d='m53.976 64.675v4.756z'/%3E%3Cpath d='m56.579 64.675v4.756z'/%3E%3Cpath d='m59.183 64.675v4.756z'/%3E%3Cpath d='m61.786 64.675v4.756z'/%3E%3Cpath d='m64.39 64.675v4.756z'/%3E%3Cpath d='m66.993 64.675v4.756z'/%3E%3Cpath d='m69.597 64.675v4.756z'/%3E%3Cpath d='m72.2 64.675v4.756z'/%3E%3Cpath d='m74.804 64.675v4.756z'/%3E%3C/g%3E%3Cg transform='matrix(.26458 0 0 .26458 89.275 136.2)' fill='%2300b6b5'%3E%3Ccircle cx='53.566' cy='45.591' r='4.5182' fill='none' stroke='%2300b6b5' stroke-linecap='square' stroke-linejoin='round' stroke-width='1.954'/%3E%3Cpath d='m55.427 45.722a1.941 1.941 0 0 1-1.9279 1.941 1.941 1.941 0 0 1-1.954-1.9148 1.941 1.941 0 0 1 1.9015-1.9668 1.941 1.941 0 0 1 1.9796 1.8882' fill='%2300b6b5'/%3E%3Cg transform='translate(19.762 .64701)'%3E%3Ccircle cx='51.84' cy='44.944' r='4.5182' fill='none' stroke='%2300b6b5' stroke-linecap='square' stroke-linejoin='round' stroke-width='1.954'/%3E%3Cpath d='m53.702 45.075a1.941 1.941 0 0 1-1.9279 1.941 1.941 1.941 0 0 1-1.954-1.9148 1.941 1.941 0 0 1 1.9015-1.9668 1.941 1.941 0 0 1 1.9796 1.8882' fill='%2300b6b5'/%3E%3C/g%3E%3C/g%3E%3Cg transform='matrix(.2521 -.080322 .080322 .2521 89.328 142.29)' stroke='%2300b6b5'%3E%3Ccircle cx='59.093' cy='13.372' r='4.5182' fill='none' stroke-linecap='square' stroke-linejoin='round' stroke-width='1.954'/%3E%3Cpath d='m59.093 25.018v-7.9798z' fill='%2300b6b5' stroke-width='2.8913'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A"
export const MESSAGE_ID = 'voebbot-message'
export const BOT_ID = 'voebbot-loader'
export const LOADER_ID = 'voebbot-loading'

export const LOADER_HTML = `
<style>
#${LOADER_ID} {
  position:absolute;
  left: 50%;
  top: 50%;
  animation: voebbot-working 2s ease-in-out 0s infinite;
}

@keyframes voebbot-working {
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
  <div style="color: ${COLOR}; font-family: sans-serif; font-size: 1.2rem">VÖBBot</div>
  <img id="voebbot-loading" src="${ICON}" alt="VOEBBot" height="40" width="30">
  <div id="${MESSAGE_ID}" style="font-family: sans-serif; font-size: 0.9rem; color: ${COLOR}">Pressedatenbank wird aufgerufen...</div>
</div>`

export const FAILED_HTML = `<strong>Artikel konnte nicht gefunden werden</strong>
<ul style="text-align:left;margin-left:1rem">
<li>Titel können sich von der Druckausgabe unterscheiden. Nutzen Sie das offene Tab um nach Stichworten zu suchen.</li>
<li>ggf. ist der Artikel online exklusiv oder das Medium nicht über Ihre Bibliothek verfügbar</li>
<li>Artikel aus der gedruckten Ausgabe sind ggf. erst später verfügbar.</li>
</ul>`
