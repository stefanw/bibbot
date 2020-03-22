# VOEBBot

Browser extension that uses your [VÖBB](https://www.voebb.de/) public library account (just 10 € / year!) to remove the paywall on print articles of German online news sites.

## How it works

Your VÖBB account includes access to [genios](https://www.genios.de/) and [Munzinger](https://www.munzinger.de/) which gives you access to the print editions of most German newspapers.

When you browse the websites of German news sites the extension will detect the paywall and in the background log in to the library service, search for the article and inject the content of the article into the news site.

## Setup

This extension is in alpha development. You can clone the repository and load the directory as an unpacked extension to try it out.

Unless your browser autofills your credentials on the *various* VÖBB services, you can give the extension your 11-digit user id and password via its options page.

## Currently supported sites

- www.spiegel.de
- magazin.spiegel.de
- www.zeit.de

Caveat: the article may not be found in the library service (print articles take apparently longer to show up). Also online media has online exclusives that likely do not appear in the library services.

Many more sites are possible, please help to add more.
