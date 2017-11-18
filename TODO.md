TODO
====

This is an incomplete list of **tasks**, **ideas** and **comments** in no particular order.

Please see the list of [branches][branches] of this repository or the associated [issues][issues], [pull requests][pull requests] and [projects][projects] on Github first if you want to help or if you have something to contribute. Every opinion counts and help is very much appreciated.

Thank you very much!


-----


## New Twitch API

Twitch has introduced a new API a few months ago. This new API doesn't look good right now and it is unclear how things will turn out. They have deprecated v5 (the current one), although the new one is still under construction and only supports a subset of endpoints. The new API needs to be at least feature equal before a transition can be made here. It also introduces a rate limiting system, so it's unclear whether Streamlink Twitch GUI will be able to use its own client-id or if users will need to register their own private Twitch application in the future. It's also unclear whether all of the currently used private API endpoints will remain online. v3 has been deprecated last year and will go offline soon (which may break Livestreamer) and v5 will be removed at the end of 2018. So there is still a bit more than a year time for making the transition.


## Ember upgrade

Currently stuck at 2.9 with its legacy renderer (Glimmer 1). An upgrade to 2.10 was attempted earlier this year, but it resulted in several issues, although it was promised to be painless. One annoying, but manageable issue was the change of the now non-customizable toplevel view, resulting in a second unnecessary level of DOM nesting. Where the upgrade failed was the usage of the legacy renderer in all of the Ember related tests. Ember's own test helper modules need to be consulted again in order to fix the custom tests here. The other main issue is the deprecation of Bower and the lack of prebuilt Ember releases. A new inclusion method needs to be figured out, since we're using Webpack instead of Ember-CLI (see [#482](https://github.com/streamlink/streamlink-twitch-gui/issues/482)).


## Internal upgrading system

This has been promised a lot in the past, but not much progress has been made in quite a while. It's only necessary on Windows (when not using the Chocolatey package manager) and all that can really be done is downloading the installer and executing it. NW.js doesn't include its own upgrading mechanisms and all of the community modules which are available are not really convincing. Even if automatically downloading and executing the installer is not ideal, it should still get the job done, but it will also mean that the changelogs and notes won't be read by most users anymore.
Before the UpgradingService gets implemented, the VersioncheckService needs to be re-implemented. The Github API can be used to show the changelog (markdown) in the popup (or in a dedicated route). This requires a new markdown renderer dependency, which can also be used to render Twitch's community and team descriptions, instead of relying on their rendered output, which may be dangerous. It would also be an opportunity removing the custom semver implementation and using a proper dependency.


## Linux packages

Since .deb and .rpm packages can't get easily built and hosted due to build-, license-, dependency- or traffic issues (see PR [#319](https://github.com/streamlink/streamlink-twitch-gui/pull/319)), a few options need to be considered:
- Let TravisCI build the .deb and .rpm packages and publish them on the Github releases page. Optionally sign them and add the public key as well. This makes it easier for casual users, who can simply "double click" the package and install it. The disadvantage is the still remaining lack of upgrade mechanics and having to set distro specific dependencies.
- Let TravisCI build the .deb and .rpm packages and publish them on [Bintray](https://bintray.com) with dedicated repositories. The .deb files and the repo can be signed on Bintray, but when it was tested last year, signing issues of the rpm repo occured. Also, the traffic is fairly limited and may require publishing the files on Github as well as a backup, making Bintray questionable. In order to setup the repo on the user side, a setup bash script was written, but letting users curl and execute it is bad.
- Build a Flatpack package. Not sure about the hosting/distribution aspect, but building flatpacks makes it simple in regards of the dependencies, which is a pain in other package formats. Since it's fairly new, most users probably don't know how to install and use it. Others also may not want to use flatpack because it is another package format in addition to the one of their disto.
- Build a snap package. Not really convincing, since Flatpack basically does the same and has a wider range of adoption.


## App module structure

This is another issue of not using Ember-CLI and having an automated file name (path) based module resolver. All modules are being imported manually, so that Webpack can statically analyze the dependency tree. Writing a custom module resolver for Webpack would be ideal, but the currently used structure needs to be changed first, because templates and styles don't follow the naming scheme of the js-files, which itself is also questionable. Copying Ember's new scheme would be worth checking out. A major benefit of changing the structure would be having CSS modules, so that class naming issues don't occur and all styles become easier to maintain. This would of course require a rewrite of most stylesheets.


## Move code into private packages

Move certain modules into their own private packages, so they can be re-used and don't need to be tested here. Especially those which are a dependency of future modules that definitely don't belong in here. There are many already existing npm packages of these dependencies which are similar to the custom modules here, but most, if not all of them, are either not fitting, badly implemented or terribly bloated.


## Implement an icon resolver for Linux

Used for the tray icon. A custom module has already been written a few months ago for resolving icons according to the freedesktop icon theme specification, but it hasn't been published yet. The one that already existed was not convincing and didn't support some resolving strategies of the spec and didn't do these filesystem lookups asynchronously, which is bad.  
One major issue is still unsolved, which is the detection of the currently selected theme. Relying on the basic "hicolor" theme isn't really an option and "just" brings the improvement of being able to read the default icon from the file system instead of using the integrated one in NW.js.  
The tray icon should be customizable, and since there is no node-module available right now for detecing the icon theme, a new one needs to be written as well that does the same as neofetch or screenfetch, which is quite complex in order to achieve proper detection for most distros, DEs and WMs. I'm not aware of any better solution to this problem, unfortunately.


## FontAwesome 5

A license has been bought last year. FA5 will be released soon and comes with lots of improvements and new icons. They are using a new JS-based system for using the icons and SVGs can be used for better rendering results and consistency.


## I18n

This was being worked on earlier this year by using a popular Ember addon that is capable of pluralizing translations and performing other l10n stuff. Translations are being added in the json- or yaml format, so it's technically a custom solution, but still simple and fast. Unfortunately, adding translations is not that simple, because they need to be precise, should not break the layout and still have to sound nice. It's quite a cumbersome task. Guidelines have to be written once this gets finished and published. And new translations need to be reviewed first, if possible. Some components and styles also need to be fixed or rewritten first, because they are not flexible enough.


# VOD support

See [issue #81](https://github.com/streamlink/streamlink-twitch-gui/issues/81#issuecomment-314374666).


# Internal IRC chat

The most effort for implementing an internal chat system would be the UI. A custom IRC client with Twitch emoticon parsing (IRCv3) and an automatic server address selection (depending on the channel size, etc.) has already been written one and a half years ago and was working well from the dev tools. A requirement for having a nice UX would be the ability to choose between customizable chat windows for each channel (and user) separately, joint chat windows or the chat inside the main window. Also, the rendering of each chat line needs to be as fast as possible (looking at Glimmer 2, Ember >= 2.10). Everything else can be built in a modular way and doesn't have to be included from the beginning: Twitch chat specific stuff, users list, chat history, logging, emoticon/username autocompletion, emoticon favorites, highlighting, filtering, URL fetching, etc.


  [branches]: https://github.com/streamlink/streamlink-twitch-gui/branches
  [issues]: https://github.com/streamlink/streamlink-twitch-gui/issues
  [pull requests]: https://github.com/streamlink/streamlink-twitch-gui/pulls
  [projects]: https://github.com/streamlink/streamlink-twitch-gui/projects
