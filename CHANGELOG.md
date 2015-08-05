Changelog - Livestreamer Twitch GUI
===

## Master

- Fixed livestreamer validation failure on OSX. #121
- Fixed minimize to tray. #122
- Always show chat button on channel pages. #119
- Upgraded to NW.js v0.12.3

[Changelog](https://github.com/bastimeyer/livestreamer-twitch-gui/compare/v0.9.2...master)


## [v0.9.2](https://github.com/bastimeyer/livestreamer-twitch-gui/releases/tag/v0.9.2) (2015-07-31)

- Implemented stream language filters. #113
- Fully implemented the game following feature. #31
- Added sorting options to followed channels.
- Added option to always show stream flags. #106
- Fixed touch issues with dropdown elements. #108
- Upgraded to Ember v1.12.1 and Ember-Data v1.0.0-beta.19.2.
- Upgraded to NW.js v0.12.2.
- Some minor bug fixes and improvements.

[Changelog](https://github.com/bastimeyer/livestreamer-twitch-gui/compare/v0.9.1...v0.9.2)


## [v0.9.1](https://github.com/bastimeyer/livestreamer-twitch-gui/releases/tag/v0.9.1) (2015-05-27)

- Fixed desktop notifications.
- Added a second livestreamer fallback path on OSX. #99

[Changelog](https://github.com/bastimeyer/livestreamer-twitch-gui/compare/v0.9.0...v0.9.1)


## [v0.9.0](https://github.com/bastimeyer/livestreamer-twitch-gui/releases/tag/v0.9.0) (2015-05-25)

- Restructured mainmenu (renamed "Your" to "My"):
  - Implemented subscriptions and followed channels+games menus.
  - Removed "Recent activity" and "Most viewed" menu templates (for now).
- Implemented custom livestreamer parameters. #88
- Added livestreamer download/caching settings. #82
- Added Twitch.tv API hiccup detection (prevents notifications of all followed channels).
- Added F5 and Ctrl+R reload shortcuts.
- Added animation effects.
- Fixed stream quality dropdown glitching when closing the stream popup.
- Fixed channel pages not reloading correctly. #89
- Fixed issue with videoplayer parameters. #94
- Upgraded to Ember-Data 1.0.0-beta.17.
- Several bug fixes and improvements.

[Changelog](https://github.com/bastimeyer/livestreamer-twitch-gui/compare/v0.8.0...v0.9.0)


## [v0.8.0](https://github.com/bastimeyer/livestreamer-twitch-gui/releases/tag/v0.8.0) (2015-04-23)

- Implemented custom channel settings (see the wrench icon in the upper right corner). #23, #63
- Implemented channel search function.
- Implemented task bar / dock icon badge showing number of online favorites. #67
- Implemented player command line variables (click the button in the videoplayer settings section).
  Requires advanced settings to be enabled.
- Restructured the settings menu.
- Fixed incorrect OSX tray icon scaling. #64
- Fixed window state persistence when changing the desktop resolution.
- Fixed stream popup overwriting the channel status after a successful stream launch.
- Fixed rare HTMLBars parsing error resulting in a blank page.
- Fixed mousewheel scrolling not working sometimes.
- Upgraded NW.js to v0.12.1 (fixes the HiDPI issues on Windows). #72
- Several minor bug fixes and improvements.

[Changelog](https://github.com/bastimeyer/livestreamer-twitch-gui/compare/v0.7.3...v0.8.0)


## [v0.7.3](https://github.com/bastimeyer/livestreamer-twitch-gui/releases/tag/v0.7.3) (2015-03-29)

- Fixed application being hidden after closing it while being minimized. #62
- Replaced colored tray icons on OSX with grayscale ones.
- Fixed notification click bug where chat was opened twice in some cases.

[Changelog](https://github.com/bastimeyer/livestreamer-twitch-gui/compare/v0.7.2...v0.7.3)


## [v0.7.2](https://github.com/bastimeyer/livestreamer-twitch-gui/releases/tag/v0.7.2) (2015-03-26)

- Implemented channel pages.
- Implemented login via OAuth token. #53  
  Requires "advanced settings" to be enabled (see settings menu).
- Added more infos to the stream popup (refreshes automatically).
- Added `--tray` and `--min` start parameters. #50
- Added minimize to tray option.
- The window state will now be preserved between sessions. #48  
  Use `--reset-window` to start the application centered again.
- Fixed desktop notification bugs.
- Fixed livestreamer default path (OSX). #55
- Fixed broken keyboard shortcuts (OSX). #59
- Upgraded dependencies.
- Upgraded NW.js to v0.12.0.
- Various other bugfixes and improvements.

[Changelog](https://github.com/bastimeyer/livestreamer-twitch-gui/compare/v0.7.1...v0.7.2)


## [v0.7.1](https://github.com/bastimeyer/livestreamer-twitch-gui/releases/tag/v0.7.1) (2015-02-10)

- Fixed "Launching stream" dialog being stuck in some cases. See #45 and #38. Thanks @Wraul
- Fixed invalid aspect ratio of broken preview images.
- Restricted start menu shortcut creation on windows to win8 and higher. Required for toast notifications. See #44.
- Changed default application font to Roboto.
- Some other bugfixes

[Changelog](https://github.com/bastimeyer/livestreamer-twitch-gui/compare/v0.7.0...v0.7.1)


## [v0.7.0](https://github.com/bastimeyer/livestreamer-twitch-gui/releases/tag/v0.7.0) (2015-01-22)

- Added x64 builds for Windows and OSX (see below).
- Implemented follow-channel mechanics.
- Implemented desktop notifications.  
  The behavior of notifications can be configured at the bottom of the settings menu. Due to platform limitations, notification clicks are disabled for linux users.
- Reworked internal stream launch logic.
- The stream popup now displays all output messages of livestreamer and handles errors appropriately.
- Added channel subscription button.
- Added a feedback animation to some buttons.
- Added game info to streams in the search results.
- Changed tooltip of streams which are online for more than 24h.
- Changed tray icon menu.
- Fixed list of followed channels being cut off after the first 12 entries. #34
- Fixed unresolving auto-logins issue.
- Fixed "beta.twitch.tv" stream url issue.
- Fixed osx build issue of the previous release.
- Upgraded to latest stable version of nw.js (node-webkit) v0.11.6.
- Various other bugfixes and improvements.

[Changelog](https://github.com/bastimeyer/livestreamer-twitch-gui/compare/v0.6.1...v0.7.0)


## [v0.6.1](https://github.com/bastimeyer/livestreamer-twitch-gui/releases/tag/v0.6.1) (2014-12-12)

- **Set the required livestreamer version to v1.11.1 !!!** See #30  
  Twitch had changed their API lately, so livestreamer was unable to launch any streams. This means that you need to [install the latest livestreamer version](https://github.com/chrippa/livestreamer/releases) in order to watch twitch.tv streams. If you're running the old version, the GUI will prompt you to do so.
- Rewrote the tray-icon logic: You can now choose where to access the application from - either the taskbar/dock, tray or both. The previous settings for this option have been reset.
- Implemented language flags, showing the channel's language and broadcaster language.
- Added more stats to the featured channels and streams being watched.
- Added a link to the game the broadcaster is playing (while hovering the preview image).
- The application window now stays hidden until it has finished loading.
- Updated to latest node-webkit version v0.11.2
- Updated several dependencies (ember and ember-data)
- Fixed preview images being cached and not updated when refreshing a route.
- Fixed streams-being-watched route not fetching new data from the API when refreshing.
- Fixed select dropdowns not updating correctly.
- Fixed being able to open multiple windows by clicking links while holding modifier keys.
- Fixed app crashes caused by uncaught exceptions which were thrown by
  - clicking a livestreamer documentation link
  - featured streams having no status text

[Changelog](https://github.com/bastimeyer/livestreamer-twitch-gui/compare/v0.6.0...v0.6.1)


## [v0.6.0](https://github.com/bastimeyer/livestreamer-twitch-gui/releases/tag/v0.6.0) (2014-11-15)

- Implemented twitch.tv login (due to dependency issues, only the followed channels are currently supported #27)
- Improved the infinite scroll logic and stream tile layout
- Implemented twitter name and link parser for stream titles and descriptions
- Reworked internal data querying logic
- Menus can now be refreshed by clicking on the menu again #18
- Fixed issue where OSX was not able to find livestreamer in its default location #24
- Implemented custom homepage #25
- Added app icon to windows build #26
- Updated node-webkit to v0.11.0 (adds support for high-dpi)
- Many other small fixes and improvements

[Changelog](https://github.com/bastimeyer/livestreamer-twitch-gui/compare/v0.5.0...v0.6.0)


## [v0.5.0](https://github.com/bastimeyer/livestreamer-twitch-gui/releases/tag/v0.5.0) (2014-08-19)

- Multi stream support! #13
- The GUI may now be closed while streams are still running
- Implemented livestreamer validation / version check
- Added stream type selection to the settings #16
- Added GUI minimize option when launching a stream #16
- Added a refresh button to the titlebar
- Disabled caching of twitch.tv API requests
- Fixed various infinite scroll bugs
- Fixed missing stream quality fallbacks #15
- Made the error messages a bit more informative
- Added application icon for windows

[Changelog](https://github.com/bastimeyer/livestreamer-twitch-gui/compare/v0.4.2...v0.5.0)


## [v0.4.2](https://github.com/bastimeyer/livestreamer-twitch-gui/releases/tag/v0.4.2) (2014-08-07)

* Added chat button to the "now watching" popup #9
* Added quality change dropdown to the popup #10
* Added "minimize GUI" options
* Integrated a livestreamer download button
* The app window will now correctly appear centered on startup
* Updated node-webkit to v0.10.1
* Windows builds now have improved text rendering
* Gentoo support for Linux startscript #12
* Linux builds now include scripts for adding a launcher to the menu
* Added app-icons to OSX and Linux builds

[Changelog](https://github.com/bastimeyer/livestreamer-twitch-gui/compare/v0.4.1...v0.4.2)


## [v0.4.1](https://github.com/bastimeyer/livestreamer-twitch-gui/releases/tag/v0.4.1) (2014-06-04)

[Changelog](https://github.com/bastimeyer/livestreamer-twitch-gui/compare/v0.4.0...v0.4.1)


## [v0.4.0](https://github.com/bastimeyer/livestreamer-twitch-gui/releases/tag/v0.4.0) (2014-05-11)

* Implemented the search function
* Added startscript for linux users
* Split up the build task into `release` and `dev`. See changelog
* Added test for checking if livestreamer is set up correctly

[Changelog](https://github.com/bastimeyer/livestreamer-twitch-gui/compare/v0.3.1...v0.4.0)

![image](https://cloud.githubusercontent.com/assets/467294/2937991/b94283f2-d8e8-11e3-9636-1824d17f757a.png)


## [v0.3.1](https://github.com/bastimeyer/livestreamer-twitch-gui/releases/tag/v0.3.1) (2014-05-07)

[Changelog](https://github.com/bastimeyer/livestreamer-twitch-gui/compare/v0.3.0...v0.3.1)


## [v0.3.0](https://github.com/bastimeyer/livestreamer-twitch-gui/releases/tag/v0.3.0) (2014-02-18)

Completely redesigned the app!

Switched to a more neutral style and also removed the scaling layout. There are some elements (like the search bar) which are not yet implemented. These will be added in later releases.

[Changelog](https://github.com/bastimeyer/livestreamer-twitch-gui/compare/v0.2.3...v0.3.0)

![image](https://f.cloud.github.com/assets/467294/2199101/065a5a3c-98d1-11e3-810d-73f7ba8859ca.png)


## [v0.2.3](https://github.com/bastimeyer/livestreamer-twitch-gui/releases/tag/v0.2.3) (2014-02-12)

[Changelog](https://github.com/bastimeyer/livestreamer-twitch-gui/compare/v0.2.2...v0.2.3)


## [v0.2.2](https://github.com/bastimeyer/livestreamer-twitch-gui/releases/tag/v0.2.2) (2014-02-07)

[Changelog](https://github.com/bastimeyer/livestreamer-twitch-gui/compare/v0.2.1...v0.2.2)


## [v0.2.1](https://github.com/bastimeyer/livestreamer-twitch-gui/releases/tag/v0.2.1) (2013-12-30)

Just a patch release, no new features.

[Changelog](https://github.com/bastimeyer/livestreamer-twitch-gui/compare/v0.2.0...v0.2.1)


## [v0.2.0](https://github.com/bastimeyer/livestreamer-twitch-gui/releases/tag/v0.2.0) (2013-12-21)

In this release I've added the settings menu so you can now set the path to where you've installed livestreamer to. You can also change the default stream quality.
There is currently no validation of the user input and some more fields for customizing the videoplayer are disabled for now. I'm planning to add those things (and also the ability to choose the quality by each stream individually) in the next releases, but thats it for now.

[Changelog](https://github.com/bastimeyer/livestreamer-twitch-gui/compare/v0.1.0...v0.2.0)


## [v0.1.0](https://github.com/bastimeyer/livestreamer-twitch-gui/releases/tag/v0.1.0) (2013-12-13)

There is not much to see, just some core functionality and some design ideas.

The only thing you can do right now is browsing the top games, top channels by game and all top channels. A click on a channel will then start a new livestreamer process with the stream quality preset "best". Please make sure that livestreamer is defined in your PATH-variable. There will be no output of this child process, so please be patient and wait for your videoplayer to start.

![image](https://f.cloud.github.com/assets/467294/1742953/14df2d72-6405-11e3-983b-60c44306e2b8.png)

