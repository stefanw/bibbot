# VOEBBot

Browser extension that uses your [VÖBB](https://www.voebb.de/) public library account (just 10 € / year!) to remove the paywall on print articles of German online news sites.

## How it works

Your VÖBB account includes access to [genios](https://www.genios.de/) and [Munzinger](https://www.munzinger.de/) which gives you access to the print editions of most German newspapers.

When you browse the websites of German news sites the extension will detect the paywall and in the background log in to the library service, search for the article and inject the content of the article into the news site.

## Setup

This extension is in beta development. You can [download a release](https://github.com/stefanw/voebbot/releases) and load it in your browser.

Unless your browser autofills your credentials on the *various* VÖBB services, you can give the extension your 11-digit user id and password via its options page.

## Currently supported sites

- berliner-zeitung.de
- morgenpost.de
- handelsblatt.com
- www.spiegel.de
- magazin.spiegel.de
- sueddeutsche.de
- plus.tagesspiegel.de
- www.welt.de
- www.wiwo.de
- www.zeit.de


Many more sites are possible, please help to add more.


**Note**: the article may not be found in the library service because
 - print articles take apparently longer to show up online
 - online media may have online exclusives that may not appear in the library services
 - titles are changed for the article's online publication, so the print article cannot be found via the title. Try searching for other keywords.

If the article is not found the search tab stays open so you can look manually.
