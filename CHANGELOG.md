Changelog - Streamlink Twitch GUI
===

## [v1.5.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.5.0) (2018-04-02)

- Upgraded from Ember 2 to Ember 3. #519  
  Improves loading and rendering times.
- Implemented i18n support. #529  
  Translations can be submitted now.
- Fixed opacity of stream preview images. #534
- Fixed bug resulting in blank pages. #517
- Fixed follow game buttons (Twitch API changes). #549
- Fixed streaming provider exit code issues.
- Fixed streaming provider validation issues. #524
- Added support for future Streamlink validation changes.
- Fixed copy channel URL context menu on channel pages. #546
- Changed chat URL for all web browser based chat providers. #536
- Removed Bower build dependency. #519


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.4.1...v1.5.0)


## [v1.4.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.4.1) (2017-11-19)

This is a patch of today's [`v1.4.0`](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.4.0) release with fixes to the broken macOS archive.  
The changelog has been copied here.

- Changed default Streamlink (and Livestreamer) parameters.  
  Please see the "Player input" option in the "Streaming" settings menu and make sure that your player supports the selected method.  
- Re-implemented the chat system.  
  Please select the desired chat application in the chat settings menu.  
  Old chat settings won't be used.
- Re-implemented the notifications system.  
  - Now queries the API several times if more channels are streaming than one API response can contain.  
  - Uses Chromium's new freedesktop notification implementation on Linux.
- Re-implemented application settings.  
  - Cleaned up the internal settings data structure.
  - Renamed and reordered settings submenus.
  - Moved certain settings to different submenus.
- Re-implemented several other components and modules.
- Added Vodcast indicators. #478
- Added desktop shortcut option to the Windows installers. #483
- Added option to GUI settings to hide window control buttons. #505
- Fixed some tooltips showing a channel's ID instead of its name.
- Fixed application not closing correctly sometimes.
- Fixed infinite scrolling in the search results.
- Fixed application window focus when clicking a notification. #465
- Fixed banned channels breaking the infinite scroll mechanism. #466
- Fixed login issues when using multiple accounts. #474
- Fixed chat application opening again when restarting a stream. #475
- Fixed channel page layout with empty descriptions. #498
- Fixed global menubar preferences hotkey on macOS. #508
- Upgraded to NW.js 0.26.6 (Chromium 62.0.3202.94 / Node 9.1.0)
- \[dev] Switched from npm to yarn.
- \[dev] Added a TODO list.

Since v1.4.0:

- Fixed broken macOS archives. #509
- Fixed (un)check all languages not working. #510


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.3.1...v1.4.1)


## [v1.4.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.4.0) (2017-11-19)

- Changed default Streamlink (and Livestreamer) parameters.  
  Please see the "Player input" option in the "Streaming" settings menu and make sure that your player supports the selected method.  
- Re-implemented the chat system.  
  Please select the desired chat application in the chat settings menu.  
  Old chat settings won't be used.
- Re-implemented the notifications system.  
  - Now queries the API several times if more channels are streaming than one API response can contain.  
  - Uses Chromium's new freedesktop notification implementation on Linux.
- Re-implemented application settings.  
  - Cleaned up the internal settings data structure.
  - Renamed and reordered settings submenus.
  - Moved certain settings to different submenus.
- Re-implemented several other components and modules.
- Added Vodcast indicators. #478
- Added desktop shortcut option to the Windows installers. #483
- Added option to GUI settings to hide window control buttons. #505
- Fixed some tooltips showing a channel's ID instead of its name.
- Fixed application not closing correctly sometimes.
- Fixed infinite scrolling in the search results.
- Fixed application window focus when clicking a notification. #465
- Fixed banned channels breaking the infinite scroll mechanism. #466
- Fixed login issues when using multiple accounts. #474
- Fixed chat application opening again when restarting a stream. #475
- Fixed channel page layout with empty descriptions. #498
- Fixed global menubar preferences hotkey on macOS. #508
- Upgraded to NW.js 0.26.6 (Chromium 62.0.3202.94 / Node 9.1.0)
- \[dev] Switched from npm to yarn.
- \[dev] Added a TODO list.


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.3.1...v1.4.0)


## [v1.3.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.3.1) (2017-05-28)

- Added back explicit quality selections for Streamlink. #454
- Fixed misconfiguration of the stream quality exclusion list. #452
- Fixed Streamlink portable issues on Windows. #451
- Fixed python executable resolving issues on MacOS/Linux. #459
- Fixed middle clicks on links on channel pages. #450
- Fixed ended streams not being removed from the watching list.
- Fixed streaming provider error messages.
- Improved initialization of the application window.
- Changed new parameters to be also available on app start.
- Upgraded NW.js to 0.21.6.


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.3.0...v1.3.1)


## [v1.3.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.3.0) (2017-05-18)

- Implemented a new quality selection method. #434  
  Please upgrade to [Streamlink](https://streamlink.github.io/install.html) if you're still using Livestreamer, as it doesn't receive updates anymore and broken stream quality selections can't be fixed.
- Rewrote the stream launching system.
- Added a restart stream dialog that shows up when an active stream has ended on its own.  
  This can be disabled in the "Streams" settings menu.
- Added a dialog for switching to a hosted stream. #446
- Added support for Streamlink installations via homebrew on MacOS. #440  
  The streamlink-twitch-gui homebrew cask now has streamlink set as a homebrew formula dependency.  
- Added missing "Copy link address" context menu entries. #436
- Added an option to disable the GUI restoring itself when clicking a notification. #449
- Added runtime parameters for launching streams, changing routes and resetting the window (see the wiki). #441
- Fixed the application window initialization. The maximized state will now be restored between sessions. #324
- Fixed search bar query validation regex. #437
- Fixed being able to open external links in another window. #447
- Fixed old Streamlink documentation URL.


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.2.1...v1.3.0)


## [v1.2.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.2.1) (2017-03-31)

- Added the new stream qualities to the quality presets. #434
- Added more streamlink fallback paths on MacOS.
- Added error/debug message logging.
- Fixed game search results being empty.
- Fixed native notifications on MacOS.
- Fixed custom player title variable `{delay}`.
- Fixed escape hotkey not working on text input elements.
- Upgraded NWjs to 0.21.3.
- \[dev] Upgraded to Webpack 2.


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.2.0...v1.2.1)


## [v1.2.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.2.0) (2017-03-17)

- Upgraded to Twitch API v5.
- Implemented Communities. #409
- Implemented Teams. #93
- Implemented unfollow channel/game confirmation. #344
- Implemented basic hotkeys. #399
- Restructured main menu.
- Restructured channel pages and the followed games menu.
- Removed max values from stream launch attempt settings. #401
- Fixed language filters not being updated after saving settings.
- Fixed duplicate streams detection.
- Fixed graphic glitches on Windows. #357
- Fixed VLC player preset on MacOS. #388
- Fixed invisible content when shrinking app window beyond its min width. #411
- Fixed notification types other than "auto" using fallbacks.
- Fixed substitutions in custom player window titles.
- Upgraded NW.js to 0.20.0.
- Several other bugfixes and improvements.


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.1.1...v1.2.0)


## [v1.1.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.1.1) (2017-01-01)

- Fixed Livestreamer standalone validation. #386


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.1.0...v1.1.1)


## [v1.1.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.1.0) (2017-01-01)

- Set the required min. version of Streamlink to `0.2.0`. #256 #362  
  https://streamlink.github.io/install.html
- Implemented Streamlink/Livestreamer validation cache.
- Changed the validation logic of Streamlink/Livestreamer.  
  The correct python executable should now be used on all systems.
- Fixed subscriptions menu. #377
- Fixed Streamlink version check regex. #371
- Fixed a critical bug in the Windows (un)installers.  
  The old installers have been removed from the previous releases.


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.0.1...v1.1.0)


## [v1.0.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.0.1) (2016-12-14)

- Fixed file permissions on MacOS and Linux. #210 #349
- Fixed maximize button only working once. #350
- Fixed VLC player preset on MacOS. #354 #355
- Fixed subscriptions page not working correctly. #356
- Fixed graphics glitches on Windows. #357
- Fixed drag & drop not being disabled. #359
- Fixed bug when notifications were disabled in Windows 10. #366
- Disabled chromium's internal smooth scrolling. #365


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.0.0...v1.0.1)


## [v1.0.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.0.0) (2016-12-04)

**"Livestreamer Twitch GUI" is now "Streamlink Twitch GUI"**

The application has been renamed and moved to [Streamlink](https://github.com/streamlink/streamlink).  
Streamlink is a fork of Livestreamer with active development.

Livestreamer will continue to work, but please have in mind that support may be dropped at any time. Streamlink installation instructions can be found [here](https://streamlink.github.io/install.html).

Please be aware that the name of the application's config folder has changed. Informations on how to migrate the old data can be found in the [Wiki](https://github.com/streamlink/streamlink-twitch-gui/wiki).


- Upgraded from legacy NW.js (v0.12.3) to latest stable version (v0.19.0). #275
- Implemented system for switching between Streamlink and Livestreamer. #331  
  Please re-validate your Streamlink/Livestreamer settings (default is Streamlink).
- Implemented player presets. #257  
  Please check your player settings and choose a player preset for having a configuration that works best with Streamlink or Livestreamer.
- Implemented new notification system.
- Added Windows installer.
- Added alt+left/right hotkeys.
- Added Streamlink parameter to disable redirection of hosting channels.
- Fixed "Streamlink" and "Livestreamer via python-pip" issues on Windows. #336
- Fixed text rendering issues on Windows. #232
- Fixed stream info bar visibility bug. #342
- Fixed broken number input fields on MacOS. #282
- Fixed apply/discard settings buttons being clickable while being hidden.
- Resolved memory leaks (legacy NW.js) #207
- Resolved incorrect dimensions of maximized window on Windows. (legacy NW.js) #227
- Resolved high CPU usage on MacOS (legacy NW.js) #234
- Resolved HiDPI issues on Linux (legacy NW.js) #277
- \[dev] Implemented QUnit test bridge based on the Chrome debugging protocol.
- Upgraded to Ember/EmberData 2.9


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.16.0...v1.0.0)


## [v0.16.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.16.0) (2016-10-15)

- Added initial support for Streamlink (in addition to Livestreamer).  
  See "The future of Livestreamer Twitch GUI" (#331) for more infos.
- Added another workaround for Livestreamer's broken quality selection. #323
- Implemented custom Livestreamer quality presets (advanced settings).
- Re-enabled filtering multiple stream languages. #151
- Added option to choose between custom and default channel names.
- Fixed stream popup closing unexpectedly sometimes.
- Fixed subscriptions menu showing incorrect subscription times.
- Upgraded to Ember/EmberData 2.8.


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.15.2...v0.16.0)


## [v0.15.2](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.15.2) (2016-09-16)

- Fixed InfiniteScrollMixin using invalid request offsets when refreshing or revisiting the same route. #314


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.15.1...v0.15.2)


## [v0.15.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.15.1) (2016-09-15)

- Implemented a better workaround for the Livestreamer Client-ID issue. #310
- Added option to disable Livestreamer authentication. #308
- Fixed tray icon being invisible on Windows. #312


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.15.0...v0.15.1)


## [v0.15.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.15.0) (2016-09-15)

- Added authentication check to the stream launch routine (see below). #310
- Added support for custom channel names. #303
- Added subreddit and reddit username link parsers.
- Switched from RequireJS to Webpack and overhauled the build system. #295
- Refactored all application modules to ES2015.
- Upgraded to Ember/EmberData 2.7.

Since September 15th, all anonymous Twitch API requests will now be rejected. This has been announced several weeks ago and the Livestreamer Twitch GUI was upgraded in the `v0.14.0` release. Unfortunately, Livestreamer did not receive any upgrades due to the inactivity of its maintainer and it is unknown if there will be any upgrades at all in the future.
The only workaround for this missing change is forcing all users to log in and let Livestreamer use their Twitch OAuth token. Livestreamer Twitch GUI has always passed the user's login data to Livestreamer, which means that you're fine unless you did not log in to you Twitch account in the GUI. See #310 for more information.

Please also see #289 if you think you can help with the organization of a Livestreamer fork. There are several bugs that need to be fixed and some features/ideas that need to be implemented for a better experience. This will benefit all Livestreamer and Livestreamer Twitch GUI users, thank you!


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.14.2...v0.15.0)


## [v0.14.2](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.14.2) (2016-08-08)

- Added 1080p60 quality as fallback to source.  
  Fixes dota2ti streams not working. #283


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.14.1...v0.14.2)


## [v0.14.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.14.1) (2016-08-03)

- Fixed application launch bug. #278
- Fixed broken custom Chromium/Chrome executable paths. #270
- Fixed (un)following games not working sometimes. #273
- Fixed unlinked channel images being clickable. #274
- Added new Twitch stream qualities as fallback.  
  Fixes livestreamer selecting the wrong quality. 322cc8c  
  https://blog.twitch.tv/-705404e95cc2


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.14.0...v0.14.1)


## [v0.14.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.14.0) (2016-07-11)

- Include ClientID in all API requests.  
  See https://blog.twitch.tv/-afbb8e95f843
- Reworked the settings menu.
- Added "custom channel settings" submenu to settings.
- Added "live" and "all" switch to followed games. #243, #148, #109
- Added inline stream control buttons to the "Watching now" menu. #251
- Added invalid input detection for the `--player-args` parameter.
- Added setting to disable auto-chat when launching streams via the context menu. #240
- Added more fallback paths for Livestreamer (on Windows) and also for Java (used by Chatty).
- Reimplemented OSX menubar and added preferences hotkey (`CMD+,`). #245
- Renewed the language filter list and disabled languages with localization codes (not supported by Twitch anymore, use the main one instead).
- Fixed broken follow game button and use new Twitch API endpoint.
- Fixed player parameter characters being escaped unnecessarily.
- Fixed broken initial start menu shortcut creation on Windows. #224
- Fixed current working directory being in the temp folder on Windows. #237
- Fixed old Livestreamer parameter documentation URL. #244
- Fixed reloading initial error routes.


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.13.0...v0.14.0)


## [v0.13.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.13.0) (2016-03-30)

- Implemented hosted streams. #220
- Implemented detection of duplicated items in infinite scroll lists. #216
- Added livestreamer retry options to settings.
- Added close stream context menu entry.
- Added option to switch between game and title in stream previews. #215
- Added twitch stream link detection for external links. #228
- Added support for filtering a single language. #151
- Added checkbox to disable smooth scrolling. #204
- Increased size of the search history. #217
- Fixed missing stream titles causing menus to be empty. #214
- Fixed chatty parameters while not being logged in.
- Fixed issues with third party chat applications. #231
- Fixed infinite scroll on unscaled UHD resolutions. #230
- Upgraded to Ember/EmberData 2.4.0 LTS

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.12.0...v0.13.0)


## [v0.12.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.12.0) (2016-02-06)

- Re-implemented the authentication system. #209
- Improved desktop notification failure detection.
- Fixed OSX cmd+r refresh shortcut. #203

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.11.2...v0.12.0)


## [v0.11.2](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.11.2) (2016-01-23)

- Implemented right click context menus. #180
- Implemented additional stream click actions. #180
- Implemented automatic menu refresh on focus regain. #177
- Reworked error handling of desktop notifications. #176
- Added "Audio only" stream quality. #195
- Added always show game option to settings. #178
- Added option for disabling Windows8+ startmenu shortcut creation. #173
- Fixed not being able to refresh menus that failed to load. #189
- Fixed bug causing scrolling to stop working. #196
- Fixed blurry application icon on Linux.

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.11.1...v0.11.2)


## [v0.11.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.11.1) (2015-12-05)

- Implemented channel details.
- Changed details view in stream list items.
- Added OSX refresh shortcut. #152
- Added --max launch parameter. #161
- Added OAuth token variable to custom chat method.
- Added Chatty startscript fallback. #159
- Fixed bug causing certain locations of Chatty to be rejected. #150
- Fixed image preloading system issue.
- Upgraded to Ember/EmberData 2.1.0.

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.11.0...v0.11.1)


## [v0.11.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.11.0) (2015-10-16)

- Implemented theme switcher and added dark theme.
- Implemented menu-related random stream launch button.
- Implemented stream status overlay for stream list items.
- Added notification toggling mechanism to tray icon context menu. #139
- Added Chatty to custom chat methods (requires >=0.8.2b2).
- Added loading spinner and replaced old loading animation.
- Added twitchemotes.com button to channel pages / stream popup (can be enabled in settings). #143
- Fixed subscribe button being visible on all channel pages / popups. #142
- Fixed text of closing modal dialog.

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.10.1...v0.11.0)


## [v0.10.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.10.1) (2015-09-14)

- Fixed livestreamer validation.
- Fixed image preloader.
- Fixed application name in gnome panel. #136

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.10.0...v0.10.1)


## [v0.10.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.10.0) (2015-09-13)

- Implemented multiple chat methods. #132
- Implemented real stream language filters. #133
- Reworked stream popup with better log/warning/error output. #123
- Added stream URL support to the search bar. #126
- Added totals of listed games/channels/streams to various page headers.
- Fixed subscription item background if channel hasn't set one.
- Fixed missing desktop notification icons on Windows.
- Fixed issue regarding player parameters and disabled advanced settings.
- Several bug fixes and improvements.
- Upgraded application to Ember/Ember-Data 2.0.

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.9.3...v0.10.0)


## [v0.9.3](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.9.3) (2015-08-05)

- Fixed livestreamer validation failure on OSX. #121
- Fixed minimize to tray. #122
- Always show chat button on channel pages. #119
- Upgraded to NW.js v0.12.3.

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.9.2...v0.9.3)


## [v0.9.2](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.9.2) (2015-07-31)

- Implemented stream language filters. #113
- Fully implemented the game following feature. #31
- Added sorting options to followed channels.
- Added option to always show stream flags. #106
- Fixed touch issues with dropdown elements. #108
- Upgraded to Ember v1.12.1 and Ember-Data v1.0.0-beta.19.2.
- Upgraded to NW.js v0.12.2.
- Some minor bug fixes and improvements.

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.9.1...v0.9.2)


## [v0.9.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.9.1) (2015-05-27)

- Fixed desktop notifications.
- Added a second livestreamer fallback path on OSX. #99

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.9.0...v0.9.1)


## [v0.9.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.9.0) (2015-05-25)

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

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.8.0...v0.9.0)


## [v0.8.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.8.0) (2015-04-23)

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

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.7.3...v0.8.0)


## [v0.7.3](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.7.3) (2015-03-29)

- Fixed application being hidden after closing it while being minimized. #62
- Replaced colored tray icons on OSX with grayscale ones.
- Fixed notification click bug where chat was opened twice in some cases.

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.7.2...v0.7.3)


## [v0.7.2](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.7.2) (2015-03-26)

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

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.7.1...v0.7.2)


## [v0.7.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.7.1) (2015-02-10)

- Fixed "Launching stream" dialog being stuck in some cases. See #45 and #38. Thanks @Wraul
- Fixed invalid aspect ratio of broken preview images.
- Restricted start menu shortcut creation on windows to win8 and higher. Required for toast notifications. See #44.
- Changed default application font to Roboto.
- Some other bugfixes

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.7.0...v0.7.1)


## [v0.7.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.7.0) (2015-01-22)

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

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.6.1...v0.7.0)


## [v0.6.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.6.1) (2014-12-12)

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

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.6.0...v0.6.1)


## [v0.6.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.6.0) (2014-11-15)

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

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.5.0...v0.6.0)


## [v0.5.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.5.0) (2014-08-19)

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

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.4.2...v0.5.0)


## [v0.4.2](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.4.2) (2014-08-07)

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

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.4.1...v0.4.2)


## [v0.4.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.4.1) (2014-06-04)

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.4.0...v0.4.1)


## [v0.4.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.4.0) (2014-05-11)

* Implemented the search function
* Added startscript for linux users
* Split up the build task into `release` and `dev`. See changelog
* Added test for checking if livestreamer is set up correctly

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.3.1...v0.4.0)

![image](https://cloud.githubusercontent.com/assets/467294/2937991/b94283f2-d8e8-11e3-9636-1824d17f757a.png)


## [v0.3.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.3.1) (2014-05-07)

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.3.0...v0.3.1)


## [v0.3.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.3.0) (2014-02-18)

Completely redesigned the app!

Switched to a more neutral style and also removed the scaling layout. There are some elements (like the search bar) which are not yet implemented. These will be added in later releases.

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.2.3...v0.3.0)

![image](https://f.cloud.github.com/assets/467294/2199101/065a5a3c-98d1-11e3-810d-73f7ba8859ca.png)


## [v0.2.3](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.2.3) (2014-02-12)

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.2.2...v0.2.3)


## [v0.2.2](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.2.2) (2014-02-07)

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.2.1...v0.2.2)


## [v0.2.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.2.1) (2013-12-30)

Just a patch release, no new features.

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.2.0...v0.2.1)


## [v0.2.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.2.0) (2013-12-21)

In this release I've added the settings menu so you can now set the path to where you've installed livestreamer to. You can also change the default stream quality.
There is currently no validation of the user input and some more fields for customizing the videoplayer are disabled for now. I'm planning to add those things (and also the ability to choose the quality by each stream individually) in the next releases, but thats it for now.

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.1.0...v0.2.0)


## [v0.1.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.1.0) (2013-12-13)

There is not much to see, just some core functionality and some design ideas.

The only thing you can do right now is browsing the top games, top channels by game and all top channels. A click on a channel will then start a new livestreamer process with the stream quality preset "best". Please make sure that livestreamer is defined in your PATH-variable. There will be no output of this child process, so please be patient and wait for your videoplayer to start.

![image](https://f.cloud.github.com/assets/467294/1742953/14df2d72-6405-11e3-983b-60c44306e2b8.png)

