Changelog - Streamlink Twitch GUI
===

## Master

- Implemented Spanish translations (es) ([#818](https://github.com/streamlink/streamlink-twitch-gui/pull/818))
- Implemented Italian translations (it) ([#823](https://github.com/streamlink/streamlink-twitch-gui/pull/823))
- Fixed context menu position on displays with fractional scaling ([#817](https://github.com/streamlink/streamlink-twitch-gui/issues/817))
- Fixed HTML tags being escaped in translations
- Fixed Windows uninstaller not removing some directories
- Fixed French translations ([#826](https://github.com/streamlink/streamlink-twitch-gui/pull/826))
- Upgraded NW.js to 0.56.0 (Chromium 93.0.4577.63 / NodeJS 16.4.2)


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.12.0...master)


## [v1.12.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.12.0) (2021-08-08)

- Replaced buttons for following and subscribing channels ([#813](https://github.com/streamlink/streamlink-twitch-gui/issues/813))  
  Twitch has decided to shut down the follow-channel API endpoints, which means that 3rd party applications using their public APIs won't be able to follow or unfollow channels anymore. As a workaround, the buttons have been replaced with one that opens the channel page on Twitch.tv in the system's web browser.  
  Please see the [comment on issue #813](https://github.com/streamlink/streamlink-twitch-gui/issues/813#issuecomment-890420938) and the [commit message of `402cab1`](https://github.com/streamlink/streamlink-twitch-gui/commit/402cab14f30fb43692420288ae43487fe0d7f24d) for all the details and how you can help make Twitch restore this feature again via their feedback tracker. Thank you!
- Added chat profile for Chatterino ([#607](https://github.com/streamlink/streamlink-twitch-gui/issues/607))
- Added `--no-keepaspect-window` to MPV player profile
- Added support for more TLDs to the linkparser
- Added platform details to about page ([#770](https://github.com/streamlink/streamlink-twitch-gui/pull/770))
- Changed log dir on Linux according to new XDG-base-dir spec version 0.8
- Fixed header text length in modal dialogs
- Fixed being able to stack multiple quit dialogs
- Fixed context menu on documentation links
- Fixed Windows uninstaller not removing some files
- Removed MSIE chat profile
- Upgraded snoretoast (Windows notification provider) to 0.7.0
- Upgraded NW.js to 0.52.2 (Chromium 89.0.4389.114 / NodeJS 15.12.0)
- Upgraded Linux AppImage ([#798](https://github.com/streamlink/streamlink-twitch-gui/issues/798))
- \[dev\] Upgraded from webpack 4 to webpack 5 ([#803](https://github.com/streamlink/streamlink-twitch-gui/pull/803), [#812](https://github.com/streamlink/streamlink-twitch-gui/pull/812))
- \[dev\] Upgraded from ember-i18n to ember-intl (new translation formats) ([#806](https://github.com/streamlink/streamlink-twitch-gui/pull/806))


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.11.0...v1.12.0)


## [v1.11.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.11.0) (2020-12-22)

- :warning: Set Streamlink's version requirement to `2.0.0`.  
  Upgrade to the latest Streamlink version [here](https://streamlink.github.io/install.html) or see the [wiki](https://github.com/streamlink/streamlink-twitch-gui/wiki).
- Added AppImage builds for Linux. [#735](https://github.com/streamlink/streamlink-twitch-gui/issues/735)
- Added daily debug builds for Windows, macOS and Linux. [#736](https://github.com/streamlink/streamlink-twitch-gui/issues/736)
- Implemented Russian translations (ru). [#740](https://github.com/streamlink/streamlink-twitch-gui/issues/740)
- Implemented Brazilian Portuguese translations (pt-br). [#741](https://github.com/streamlink/streamlink-twitch-gui/issues/741)
- Re-implemented modal service and made dialogs stackable.
- Re-implemented stream language filtering. [#753](https://github.com/streamlink/streamlink-twitch-gui/issues/753)
- Fixed adapter issue when loading multiple Twitch users at once.
- Various small translation fixes/additions. [#742](https://github.com/streamlink/streamlink-twitch-gui/issues/742)
- Refactored auth and versioncheck service.
- \[dev\] Refactored lots of build scripts and configs.
- \[dev\] Switched CI provider from TravisCi+AppVeyor to Github Actions.


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.10.0...v1.11.0)


## [v1.10.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.10.0) (2020-05-31)

- :warning: Set Streamlink's version requirement to `1.4.0`.  
  Upgrade to the latest Streamlink version [here](https://streamlink.github.io/install.html) or see the [wiki](https://github.com/streamlink/streamlink-twitch-gui/wiki).
- :warning: Simplified streaming provider configuration.  
  In some cases, you may need to re-apply your Streamlink settings if you've previously set custom file paths. [#718](https://github.com/streamlink/streamlink-twitch-gui/issues/718)
- Added option for low latency streaming to the streaming settings menu. As mentioned in the Streamlink docs, you may also need to customize your player's own caching/buffering settings.
- Added option for low latency streaming and disabling ads to the channel settings menu. [#723](https://github.com/streamlink/streamlink-twitch-gui/issues/723)
- Added customizable hotkeys. [#502](https://github.com/streamlink/streamlink-twitch-gui/issues/502)
- Added toggle for showing stream uptime hours instead of days. [#713](https://github.com/streamlink/streamlink-twitch-gui/issues/713)
- Fixed language selection not returning any streams. Due to a new Twitch API limitation, only one language can be selected now. [#706](https://github.com/streamlink/streamlink-twitch-gui/issues/706)
- Fixed preview images missing in the featured streams menu. [#720](https://github.com/streamlink/streamlink-twitch-gui/issues/720)
- Fixed twitchemotes.com URL when clicking the emotes button. [#705](https://github.com/streamlink/streamlink-twitch-gui/issues/705)
- Fixed desktop notifications showing incorrect app name on Linux. [#715](https://github.com/streamlink/streamlink-twitch-gui/issues/715)
- Fixed various translations.
- Changed build method on Windows and Linux. Uncompressed app files are now directly included in the install directory.
- Improved build config and made builds reproducible.
- Upgraded NW.js to to 0.45.5 (Chromium 81.0.4044.129 / NodeJS 14.0.0).


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.9.1...v1.10.0)


## [v1.9.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.9.1) (2020-01-29)

- :warning: Set Streamlink's version requirement to `1.3.1`.  
  Upgrade to the latest Streamlink version [here](https://streamlink.github.io/install.html) or see the [wiki](https://github.com/streamlink/streamlink-twitch-gui/wiki).
- Added workaround for followed streams not being sorted by viewer count. [#699](https://github.com/streamlink/streamlink-twitch-gui/issues/699)  
  Apparently, the API changes have finally been fixed again by Twitch. The workaround will be kept though.
- Added `ctrlKey` modifier to most hotkeys and changed share-channel hotkey. [#696](https://github.com/streamlink/streamlink-twitch-gui/issues/696)  
  Customizable hotkeys will be added in one of the next releases.
- Fixed hotkeys triggering when modifiers were not matching exactly. [#696](https://github.com/streamlink/streamlink-twitch-gui/issues/696)
- Fixed MPV player preset related to recent breaking changes of MPV's parameter parsing.
- Fixed some localization issues. [#690](https://github.com/streamlink/streamlink-twitch-gui/issues/690), [#691](https://github.com/streamlink/streamlink-twitch-gui/issues/691)
- Changed Twitch OAuth URL to correct new URL when signing in.


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.9.0...v1.9.1)


## [v1.9.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.9.0) (2019-11-23)

This release mainly focuses on fixing the recent issues related to the [breaking changes of Twitch's API](https://github.com/streamlink/streamlink/issues/2680). Since the situation wasn't 100% clear for the first couple of days, we had to wait until we were able to make a proper decision.

For Streamlink Twitch GUI, this means that a couple of features had to be removed, unfortunately. If Twitch decides to make the API endpoints available to third party app developers which were required by the removed features, I will be more than happy to re-implement them.

Support for Livestreamer has also finally been removed. If you were still using Livestreamer, you will have to [install and use Streamlink now](https://github.com/streamlink/streamlink-twitch-gui/wiki/Installation).

- :warning: Set Streamlink's version requirement to `1.3.0`.  
  Upgrade to the latest Streamlink version [here](https://streamlink.github.io/install.html) or see the [wiki](https://github.com/streamlink/streamlink-twitch-gui/wiki).
- Removed everything that was using Twitch's old private API. [#684](https://github.com/streamlink/streamlink-twitch-gui/issues/684)
  - Removed channel panels.
  - Removed subscriptions list.
  - Removed hosted streams list.
  - Removed followed games list and (un)follow game button.
- Removed deprecated Livestreamer support. [#667](https://github.com/streamlink/streamlink-twitch-gui/issues/667)
- Removed login sharing with Streamlink. [#682](https://github.com/streamlink/streamlink-twitch-gui/issues/682)
- Added back automatic theme selection. [#666](https://github.com/streamlink/streamlink-twitch-gui/issues/666)
- Added more fallback paths for VLC and MPV on macOS. [#664](https://github.com/streamlink/streamlink-twitch-gui/issues/664)
- Added media title parameter to MPV player preset. [#683](https://github.com/streamlink/streamlink-twitch-gui/issues/683)
- Upgraded NW.js to 0.42.3 (Chromium 78.0.3904.97 / NodeJS 13.1.0).
- Updated donation links and texts.


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.8.1...v1.9.0)


## [v1.8.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.8.1) (2019-08-09)

This is a critical bugfix release for the crashing Windows builds since v1.8.0 which downgrades the used NW.js version. See [#656](https://github.com/streamlink/streamlink-twitch-gui/issues/656) for more information.

If you've already upgraded to v1.8.0, regardless the OS, you may see an NW.js downgrade error message (once) in the future. This can be ignored. Deleting the user-data-dir, which will wipe your settings and login, before upgrading to v1.8.1 and downgrading NW.js is also an option.

If you're coming from v1.7.1, you can ignore all of this.

Once again, I apologize for the inconveniences.

Please see the full changelog of the [v1.8.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.8.0) release!

- Downgraded NW.js to 0.39.3 (Chromium 75.0.3770.142 / Node 12.6.0).
- Reverted automatic theme selection (dependent on Chromium 76).


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.8.0...v1.8.1)


## [v1.8.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.8.0) (2019-08-08)

- Removed "Communities" (feature was already removed by Twitch). [#652](https://github.com/streamlink/streamlink-twitch-gui/issues/652)
- Added automatic light/dark theme selection. Needs to be supported by the OS.
- Added translations for locale "fr". [#642](https://github.com/streamlink/streamlink-twitch-gui/issues/642)
- Fixed white page being shown while app is loading.
- Fixed errors not being logged correctly.
- Fixed broken stream popup when re-launching streams. [#637](https://github.com/streamlink/streamlink-twitch-gui/issues/637)
- Fixed shrinking stream thumbnails when pressing TAB. [#645](https://github.com/streamlink/streamlink-twitch-gui/issues/645)
- Fixed channel settings not loading when re-visiting route. [#646](https://github.com/streamlink/streamlink-twitch-gui/issues/646)
- Fixed hotkeys while having an input element focused. [#647](https://github.com/streamlink/streamlink-twitch-gui/issues/647)
- Fixed undefined channel name in the edit/cancel subscription URL. [#651](https://github.com/streamlink/streamlink-twitch-gui/issues/651)
- Upgraded NW.js to 0.40.0 (Chromium 76.0.3809.87 / Node 12.6.0).
- Upgraded lots of dependencies and removed jQuery.
- Upgraded to EmberData 3.9.


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.7.1...v1.8.0)


## [v1.7.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.7.1) (2019-04-17)

- Fixed login issues on Windows. [#628](https://github.com/streamlink/streamlink-twitch-gui/issues/628)
- Fixed pin to taskbar issues on Windows. [#629](https://github.com/streamlink/streamlink-twitch-gui/issues/629)
- Fixed `--goto` parameter. [#630](https://github.com/streamlink/streamlink-twitch-gui/issues/630)
- Fixed minimize to tray. [#632](https://github.com/streamlink/streamlink-twitch-gui/issues/632)
- Fixed desktop notification issues on Windows. [#634](https://github.com/streamlink/streamlink-twitch-gui/issues/634)
- Fixed spacebar hotkey on form components.
- Made hotkeys aware of keyboard layouts (was changed in v1.7.0).
- Upgraded NW.js to 0.37.4. [#628](https://github.com/streamlink/streamlink-twitch-gui/issues/628), [#629](https://github.com/streamlink/streamlink-twitch-gui/issues/629), [#634](https://github.com/streamlink/streamlink-twitch-gui/issues/634)

Please also see the changelog of the [`v1.7.0`](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.7.0) release, if you're upgrading from an older version.


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.7.0...v1.7.1)


## [v1.7.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.7.0) (2019-04-05)

* :warning: Set Streamlink's version requirement to `1.1.0`. [#618](https://github.com/streamlink/streamlink-twitch-gui/issues/618)  
  Upgrade to the latest Streamlink version [here](https://streamlink.github.io/install.html) or see the [wiki](https://github.com/streamlink/streamlink-twitch-gui/wiki).
* :warning: Added new streaming provider `Streamlink (Windows)`. [#618](https://github.com/streamlink/streamlink-twitch-gui/issues/618)  
  This is the new default streaming provider on Windows and is required when using a Streamlink version newer than `0.14.2`.  
  Previous users of Streamlink Twitch GUI on Windows will have to switch manually from `Streamlink` to `Streamlink (Windows)` or will have to apply the workaround mentioned in [#618](https://github.com/streamlink/streamlink-twitch-gui/issues/618).
* :warning: Removed bash wrapper launch script from Linux builds.  
  Please remove and re-add menu shortcuts once (see included scripts).


- Added an option for skipping embedded stream advertisements. [#621](https://github.com/streamlink/streamlink-twitch-gui/issues/621)  
  See the [wiki](https://github.com/streamlink/streamlink-twitch-gui/wiki) for more information about this.
- Added mouse navigation buttons. [#492](https://github.com/streamlink/streamlink-twitch-gui/issues/492)
- Added architecture info to about page. [#606](https://github.com/streamlink/streamlink-twitch-gui/issues/606)
- Removed featured communities (only shows all communities now).
- Fixed not being able to watch unpartnered channels in specific qualities. [#481](https://github.com/streamlink/streamlink-twitch-gui/issues/481)
- Fixed not being able to save custom channel settings. [#595](https://github.com/streamlink/streamlink-twitch-gui/issues/595)
- Fixed VLC config on macOS. [#600](https://github.com/streamlink/streamlink-twitch-gui/issues/600)
- Fixed search bar input validation issue. [#610](https://github.com/streamlink/streamlink-twitch-gui/issues/610)
- Fixed NW.js runtime parameter parsing. [#613](https://github.com/streamlink/streamlink-twitch-gui/issues/613)
- Fixed undecoded HTML entities in desktop notifications. [#626](https://github.com/streamlink/streamlink-twitch-gui/issues/626)
- Fixed subscription date and month counter. [#627](https://github.com/streamlink/streamlink-twitch-gui/issues/627)
- Fixed refresh route logic.
- Fixed race condition in desktop notification icon downloader.
- Fixed stream data polling issue in StreamingService.
- Fixed time related translations in "de" locale.
- Upgraded to NW.js 0.37.2 (Chromium 73.0.3683.86 / Node 11.13.0). [#603](https://github.com/streamlink/streamlink-twitch-gui/issues/603)
- Upgraded to Ember 3.7 and EmberData 3.3.
- Various other dependency upgrades.
- Lots of internal changes and improvements.


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.6.0...v1.7.0)


## [v1.6.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.6.0) (2018-08-01)

- Changed default chat URL for web browser chat applications. [#536](https://github.com/streamlink/streamlink-twitch-gui/issues/536)
- Changed log and cache directories on macOS and Linux. See 5f66c1ea.
- Added translations for locale "zh-tw". [#567](https://github.com/streamlink/streamlink-twitch-gui/issues/567)
- Added translations for locale "de". [#590](https://github.com/streamlink/streamlink-twitch-gui/issues/590)
- Added more fallback paths to the Chatty preset.
- Added support for choosing between different chat URLs.
- Added more debug logging to the ChatService.
- Fixed logic for resolving the python executable on macOS and Linux. [#589](https://github.com/streamlink/streamlink-twitch-gui/issues/589)
- Fixed game menu losing game filter after scrolling. [#575](https://github.com/streamlink/streamlink-twitch-gui/issues/575)
- Fixed stream popup also being auto-closed on error. [#560](https://github.com/streamlink/streamlink-twitch-gui/issues/560)
- Fixed close button in watching list not removing streams. [#467](https://github.com/streamlink/streamlink-twitch-gui/issues/467)
- Fixed Vodcast detection (Twitch API change).
- Fixed Streamlink output regex for Streamlink >=0.13.0 <0.14.0
- Fixed startup animation being too early on slower systems.
- Fixed typos in localization keys of the "en" locale. [#557](https://github.com/streamlink/streamlink-twitch-gui/issues/557)
- Fixed race condition when downloading notification icons.
- Set Noto Sans as additional fallback system font (for CJK texts).
- Upgraded to Webpack 4.
- Implemented custom Ember module unification loader for Webpack.
- Lots of internal changes and improvements.


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.5.0...v1.6.0)


## [v1.5.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.5.0) (2018-04-02)

- Upgraded from Ember 2 to Ember 3. [#519](https://github.com/streamlink/streamlink-twitch-gui/issues/519)  
  Improves loading and rendering times.
- Implemented i18n support. [#529](https://github.com/streamlink/streamlink-twitch-gui/issues/529)  
  Translations can be submitted now.
- Fixed opacity of stream preview images. [#534](https://github.com/streamlink/streamlink-twitch-gui/issues/534)
- Fixed bug resulting in blank pages. [#517](https://github.com/streamlink/streamlink-twitch-gui/issues/517)
- Fixed follow game buttons (Twitch API changes). [#549](https://github.com/streamlink/streamlink-twitch-gui/issues/549)
- Fixed streaming provider exit code issues.
- Fixed streaming provider validation issues. [#524](https://github.com/streamlink/streamlink-twitch-gui/issues/524)
- Added support for future Streamlink validation changes.
- Fixed copy channel URL context menu on channel pages. [#546](https://github.com/streamlink/streamlink-twitch-gui/issues/546)
- Changed chat URL for all web browser based chat providers. [#536](https://github.com/streamlink/streamlink-twitch-gui/issues/536)
- Removed Bower build dependency. [#519](https://github.com/streamlink/streamlink-twitch-gui/issues/519)


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
- Added Vodcast indicators. [#478](https://github.com/streamlink/streamlink-twitch-gui/issues/478)
- Added desktop shortcut option to the Windows installers. [#483](https://github.com/streamlink/streamlink-twitch-gui/issues/483)
- Added option to GUI settings to hide window control buttons. [#505](https://github.com/streamlink/streamlink-twitch-gui/issues/505)
- Fixed some tooltips showing a channel's ID instead of its name.
- Fixed application not closing correctly sometimes.
- Fixed infinite scrolling in the search results.
- Fixed application window focus when clicking a notification. [#465](https://github.com/streamlink/streamlink-twitch-gui/issues/465)
- Fixed banned channels breaking the infinite scroll mechanism. [#466](https://github.com/streamlink/streamlink-twitch-gui/issues/466)
- Fixed login issues when using multiple accounts. [#474](https://github.com/streamlink/streamlink-twitch-gui/issues/474)
- Fixed chat application opening again when restarting a stream. [#475](https://github.com/streamlink/streamlink-twitch-gui/issues/475)
- Fixed channel page layout with empty descriptions. [#498](https://github.com/streamlink/streamlink-twitch-gui/issues/498)
- Fixed global menubar preferences hotkey on macOS. [#508](https://github.com/streamlink/streamlink-twitch-gui/issues/508)
- Upgraded to NW.js 0.26.6 (Chromium 62.0.3202.94 / Node 9.1.0)
- \[dev] Switched from npm to yarn.
- \[dev] Added a TODO list.

Since v1.4.0:

- Fixed broken macOS archives. [#509](https://github.com/streamlink/streamlink-twitch-gui/issues/509)
- Fixed (un)check all languages not working. [#510](https://github.com/streamlink/streamlink-twitch-gui/issues/510)


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
- Added Vodcast indicators. [#478](https://github.com/streamlink/streamlink-twitch-gui/issues/478)
- Added desktop shortcut option to the Windows installers. [#483](https://github.com/streamlink/streamlink-twitch-gui/issues/483)
- Added option to GUI settings to hide window control buttons. [#505](https://github.com/streamlink/streamlink-twitch-gui/issues/505)
- Fixed some tooltips showing a channel's ID instead of its name.
- Fixed application not closing correctly sometimes.
- Fixed infinite scrolling in the search results.
- Fixed application window focus when clicking a notification. [#465](https://github.com/streamlink/streamlink-twitch-gui/issues/465)
- Fixed banned channels breaking the infinite scroll mechanism. [#466](https://github.com/streamlink/streamlink-twitch-gui/issues/466)
- Fixed login issues when using multiple accounts. [#474](https://github.com/streamlink/streamlink-twitch-gui/issues/474)
- Fixed chat application opening again when restarting a stream. [#475](https://github.com/streamlink/streamlink-twitch-gui/issues/475)
- Fixed channel page layout with empty descriptions. [#498](https://github.com/streamlink/streamlink-twitch-gui/issues/498)
- Fixed global menubar preferences hotkey on macOS. [#508](https://github.com/streamlink/streamlink-twitch-gui/issues/508)
- Upgraded to NW.js 0.26.6 (Chromium 62.0.3202.94 / Node 9.1.0)
- \[dev] Switched from npm to yarn.
- \[dev] Added a TODO list.


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.3.1...v1.4.0)


## [v1.3.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.3.1) (2017-05-28)

- Added back explicit quality selections for Streamlink. [#454](https://github.com/streamlink/streamlink-twitch-gui/issues/454)
- Fixed misconfiguration of the stream quality exclusion list. [#452](https://github.com/streamlink/streamlink-twitch-gui/issues/452)
- Fixed Streamlink portable issues on Windows. [#451](https://github.com/streamlink/streamlink-twitch-gui/issues/451)
- Fixed python executable resolving issues on MacOS/Linux. [#459](https://github.com/streamlink/streamlink-twitch-gui/issues/459)
- Fixed middle clicks on links on channel pages. [#450](https://github.com/streamlink/streamlink-twitch-gui/issues/450)
- Fixed ended streams not being removed from the watching list.
- Fixed streaming provider error messages.
- Improved initialization of the application window.
- Changed new parameters to be also available on app start.
- Upgraded NW.js to 0.21.6.


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.3.0...v1.3.1)


## [v1.3.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.3.0) (2017-05-18)

- Implemented a new quality selection method. [#434](https://github.com/streamlink/streamlink-twitch-gui/issues/434)  
  Please upgrade to [Streamlink](https://streamlink.github.io/install.html) if you're still using Livestreamer, as it doesn't receive updates anymore and broken stream quality selections can't be fixed.
- Rewrote the stream launching system.
- Added a restart stream dialog that shows up when an active stream has ended on its own.  
  This can be disabled in the "Streams" settings menu.
- Added a dialog for switching to a hosted stream. [#446](https://github.com/streamlink/streamlink-twitch-gui/issues/446)
- Added support for Streamlink installations via homebrew on MacOS. [#440](https://github.com/streamlink/streamlink-twitch-gui/issues/440)  
  The streamlink-twitch-gui homebrew cask now has streamlink set as a homebrew formula dependency.  
- Added missing "Copy link address" context menu entries. [#436](https://github.com/streamlink/streamlink-twitch-gui/issues/436)
- Added an option to disable the GUI restoring itself when clicking a notification. [#449](https://github.com/streamlink/streamlink-twitch-gui/issues/449)
- Added runtime parameters for launching streams, changing routes and resetting the window (see the wiki). [#441](https://github.com/streamlink/streamlink-twitch-gui/issues/441)
- Fixed the application window initialization. The maximized state will now be restored between sessions. [#324](https://github.com/streamlink/streamlink-twitch-gui/issues/324)
- Fixed search bar query validation regex. [#437](https://github.com/streamlink/streamlink-twitch-gui/issues/437)
- Fixed being able to open external links in another window. [#447](https://github.com/streamlink/streamlink-twitch-gui/issues/447)
- Fixed old Streamlink documentation URL.


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.2.1...v1.3.0)


## [v1.2.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.2.1) (2017-03-31)

- Added the new stream qualities to the quality presets. [#434](https://github.com/streamlink/streamlink-twitch-gui/issues/434)
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
- Implemented Communities. [#409](https://github.com/streamlink/streamlink-twitch-gui/issues/409)
- Implemented Teams. [#93](https://github.com/streamlink/streamlink-twitch-gui/issues/93)
- Implemented unfollow channel/game confirmation. [#344](https://github.com/streamlink/streamlink-twitch-gui/issues/344)
- Implemented basic hotkeys. [#399](https://github.com/streamlink/streamlink-twitch-gui/issues/399)
- Restructured main menu.
- Restructured channel pages and the followed games menu.
- Removed max values from stream launch attempt settings. [#401](https://github.com/streamlink/streamlink-twitch-gui/issues/401)
- Fixed language filters not being updated after saving settings.
- Fixed duplicate streams detection.
- Fixed graphic glitches on Windows. [#357](https://github.com/streamlink/streamlink-twitch-gui/issues/357)
- Fixed VLC player preset on MacOS. [#388](https://github.com/streamlink/streamlink-twitch-gui/issues/388)
- Fixed invisible content when shrinking app window beyond its min width. [#411](https://github.com/streamlink/streamlink-twitch-gui/issues/411)
- Fixed notification types other than "auto" using fallbacks.
- Fixed substitutions in custom player window titles.
- Upgraded NW.js to 0.20.0.
- Several other bugfixes and improvements.


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.1.1...v1.2.0)


## [v1.1.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.1.1) (2017-01-01)

- Fixed Livestreamer standalone validation. [#386](https://github.com/streamlink/streamlink-twitch-gui/issues/386)


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.1.0...v1.1.1)


## [v1.1.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.1.0) (2017-01-01)

- Set the required min. version of Streamlink to `0.2.0`. [#256](https://github.com/streamlink/streamlink-twitch-gui/issues/256) [#362](https://github.com/streamlink/streamlink-twitch-gui/issues/362)  
  https://streamlink.github.io/install.html
- Implemented Streamlink/Livestreamer validation cache.
- Changed the validation logic of Streamlink/Livestreamer.  
  The correct python executable should now be used on all systems.
- Fixed subscriptions menu. [#377](https://github.com/streamlink/streamlink-twitch-gui/issues/377)
- Fixed Streamlink version check regex. [#371](https://github.com/streamlink/streamlink-twitch-gui/issues/371)
- Fixed a critical bug in the Windows (un)installers.  
  The old installers have been removed from the previous releases.


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.0.1...v1.1.0)


## [v1.0.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.0.1) (2016-12-14)

- Fixed file permissions on MacOS and Linux. [#210](https://github.com/streamlink/streamlink-twitch-gui/issues/210) [#349](https://github.com/streamlink/streamlink-twitch-gui/issues/349)
- Fixed maximize button only working once. [#350](https://github.com/streamlink/streamlink-twitch-gui/issues/350)
- Fixed VLC player preset on MacOS. [#354](https://github.com/streamlink/streamlink-twitch-gui/issues/354) [#355](https://github.com/streamlink/streamlink-twitch-gui/issues/355)
- Fixed subscriptions page not working correctly. [#356](https://github.com/streamlink/streamlink-twitch-gui/issues/356)
- Fixed graphics glitches on Windows. [#357](https://github.com/streamlink/streamlink-twitch-gui/issues/357)
- Fixed drag & drop not being disabled. [#359](https://github.com/streamlink/streamlink-twitch-gui/issues/359)
- Fixed bug when notifications were disabled in Windows 10. [#366](https://github.com/streamlink/streamlink-twitch-gui/issues/366)
- Disabled chromium's internal smooth scrolling. [#365](https://github.com/streamlink/streamlink-twitch-gui/issues/365)


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v1.0.0...v1.0.1)


## [v1.0.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v1.0.0) (2016-12-04)

**"Livestreamer Twitch GUI" is now "Streamlink Twitch GUI"**

The application has been renamed and moved to [Streamlink](https://github.com/streamlink/streamlink).  
Streamlink is a fork of Livestreamer with active development.

Livestreamer will continue to work, but please have in mind that support may be dropped at any time. Streamlink installation instructions can be found [here](https://streamlink.github.io/install.html).

Please be aware that the name of the application's config folder has changed. Informations on how to migrate the old data can be found in the [Wiki](https://github.com/streamlink/streamlink-twitch-gui/wiki).


- Upgraded from legacy NW.js (v0.12.3) to latest stable version (v0.19.0). [#275](https://github.com/streamlink/streamlink-twitch-gui/issues/275)
- Implemented system for switching between Streamlink and Livestreamer. [#331](https://github.com/streamlink/streamlink-twitch-gui/issues/331)  
  Please re-validate your Streamlink/Livestreamer settings (default is Streamlink).
- Implemented player presets. [#257](https://github.com/streamlink/streamlink-twitch-gui/issues/257)  
  Please check your player settings and choose a player preset for having a configuration that works best with Streamlink or Livestreamer.
- Implemented new notification system.
- Added Windows installer.
- Added alt+left/right hotkeys.
- Added Streamlink parameter to disable redirection of hosting channels.
- Fixed "Streamlink" and "Livestreamer via python-pip" issues on Windows. [#336](https://github.com/streamlink/streamlink-twitch-gui/issues/336)
- Fixed text rendering issues on Windows. [#232](https://github.com/streamlink/streamlink-twitch-gui/issues/232)
- Fixed stream info bar visibility bug. [#342](https://github.com/streamlink/streamlink-twitch-gui/issues/342)
- Fixed broken number input fields on MacOS. [#282](https://github.com/streamlink/streamlink-twitch-gui/issues/282)
- Fixed apply/discard settings buttons being clickable while being hidden.
- Resolved memory leaks (legacy NW.js) [#207](https://github.com/streamlink/streamlink-twitch-gui/issues/207)
- Resolved incorrect dimensions of maximized window on Windows. (legacy NW.js) [#227](https://github.com/streamlink/streamlink-twitch-gui/issues/227)
- Resolved high CPU usage on MacOS (legacy NW.js) [#234](https://github.com/streamlink/streamlink-twitch-gui/issues/234)
- Resolved HiDPI issues on Linux (legacy NW.js) [#277](https://github.com/streamlink/streamlink-twitch-gui/issues/277)
- \[dev] Implemented QUnit test bridge based on the Chrome debugging protocol.
- Upgraded to Ember/EmberData 2.9


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.16.0...v1.0.0)


## [v0.16.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.16.0) (2016-10-15)

- Added initial support for Streamlink (in addition to Livestreamer).  
  See "The future of Livestreamer Twitch GUI" ([#331](https://github.com/streamlink/streamlink-twitch-gui/issues/331)) for more infos.
- Added another workaround for Livestreamer's broken quality selection. [#323](https://github.com/streamlink/streamlink-twitch-gui/issues/323)
- Implemented custom Livestreamer quality presets (advanced settings).
- Re-enabled filtering multiple stream languages. [#151](https://github.com/streamlink/streamlink-twitch-gui/issues/151)
- Added option to choose between custom and default channel names.
- Fixed stream popup closing unexpectedly sometimes.
- Fixed subscriptions menu showing incorrect subscription times.
- Upgraded to Ember/EmberData 2.8.


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.15.2...v0.16.0)


## [v0.15.2](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.15.2) (2016-09-16)

- Fixed InfiniteScrollMixin using invalid request offsets when refreshing or revisiting the same route. [#314](https://github.com/streamlink/streamlink-twitch-gui/issues/314)


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.15.1...v0.15.2)


## [v0.15.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.15.1) (2016-09-15)

- Implemented a better workaround for the Livestreamer Client-ID issue. [#310](https://github.com/streamlink/streamlink-twitch-gui/issues/310)
- Added option to disable Livestreamer authentication. [#308](https://github.com/streamlink/streamlink-twitch-gui/issues/308)
- Fixed tray icon being invisible on Windows. [#312](https://github.com/streamlink/streamlink-twitch-gui/issues/312)


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.15.0...v0.15.1)


## [v0.15.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.15.0) (2016-09-15)

- Added authentication check to the stream launch routine (see below). [#310](https://github.com/streamlink/streamlink-twitch-gui/issues/310)
- Added support for custom channel names. [#303](https://github.com/streamlink/streamlink-twitch-gui/issues/303)
- Added subreddit and reddit username link parsers.
- Switched from RequireJS to Webpack and overhauled the build system. [#295](https://github.com/streamlink/streamlink-twitch-gui/issues/295)
- Refactored all application modules to ES2015.
- Upgraded to Ember/EmberData 2.7.

Since September 15th, all anonymous Twitch API requests will now be rejected. This has been announced several weeks ago and the Livestreamer Twitch GUI was upgraded in the `v0.14.0` release. Unfortunately, Livestreamer did not receive any upgrades due to the inactivity of its maintainer and it is unknown if there will be any upgrades at all in the future.
The only workaround for this missing change is forcing all users to log in and let Livestreamer use their Twitch OAuth token. Livestreamer Twitch GUI has always passed the user's login data to Livestreamer, which means that you're fine unless you did not log in to you Twitch account in the GUI. See [#310](https://github.com/streamlink/streamlink-twitch-gui/issues/310) for more information.

Please also see [#289](https://github.com/streamlink/streamlink-twitch-gui/issues/289) if you think you can help with the organization of a Livestreamer fork. There are several bugs that need to be fixed and some features/ideas that need to be implemented for a better experience. This will benefit all Livestreamer and Livestreamer Twitch GUI users, thank you!


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.14.2...v0.15.0)


## [v0.14.2](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.14.2) (2016-08-08)

- Added 1080p60 quality as fallback to source.  
  Fixes dota2ti streams not working. [#283](https://github.com/streamlink/streamlink-twitch-gui/issues/283)


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.14.1...v0.14.2)


## [v0.14.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.14.1) (2016-08-03)

- Fixed application launch bug. [#278](https://github.com/streamlink/streamlink-twitch-gui/issues/278)
- Fixed broken custom Chromium/Chrome executable paths. [#270](https://github.com/streamlink/streamlink-twitch-gui/issues/270)
- Fixed (un)following games not working sometimes. [#273](https://github.com/streamlink/streamlink-twitch-gui/issues/273)
- Fixed unlinked channel images being clickable. [#274](https://github.com/streamlink/streamlink-twitch-gui/issues/274)
- Added new Twitch stream qualities as fallback.  
  Fixes livestreamer selecting the wrong quality. 322cc8c  
  https://blog.twitch.tv/-705404e95cc2


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.14.0...v0.14.1)


## [v0.14.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.14.0) (2016-07-11)

- Include ClientID in all API requests.  
  See https://blog.twitch.tv/-afbb8e95f843
- Reworked the settings menu.
- Added "custom channel settings" submenu to settings.
- Added "live" and "all" switch to followed games. [#243](https://github.com/streamlink/streamlink-twitch-gui/issues/243), [#148](https://github.com/streamlink/streamlink-twitch-gui/issues/148), [#109](https://github.com/streamlink/streamlink-twitch-gui/issues/109)
- Added inline stream control buttons to the "Watching now" menu. [#251](https://github.com/streamlink/streamlink-twitch-gui/issues/251)
- Added invalid input detection for the `--player-args` parameter.
- Added setting to disable auto-chat when launching streams via the context menu. [#240](https://github.com/streamlink/streamlink-twitch-gui/issues/240)
- Added more fallback paths for Livestreamer (on Windows) and also for Java (used by Chatty).
- Reimplemented OSX menubar and added preferences hotkey (`CMD+,`). [#245](https://github.com/streamlink/streamlink-twitch-gui/issues/245)
- Renewed the language filter list and disabled languages with localization codes (not supported by Twitch anymore, use the main one instead).
- Fixed broken follow game button and use new Twitch API endpoint.
- Fixed player parameter characters being escaped unnecessarily.
- Fixed broken initial start menu shortcut creation on Windows. [#224](https://github.com/streamlink/streamlink-twitch-gui/issues/224)
- Fixed current working directory being in the temp folder on Windows. [#237](https://github.com/streamlink/streamlink-twitch-gui/issues/237)
- Fixed old Livestreamer parameter documentation URL. [#244](https://github.com/streamlink/streamlink-twitch-gui/issues/244)
- Fixed reloading initial error routes.


[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.13.0...v0.14.0)


## [v0.13.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.13.0) (2016-03-30)

- Implemented hosted streams. [#220](https://github.com/streamlink/streamlink-twitch-gui/issues/220)
- Implemented detection of duplicated items in infinite scroll lists. [#216](https://github.com/streamlink/streamlink-twitch-gui/issues/216)
- Added livestreamer retry options to settings.
- Added close stream context menu entry.
- Added option to switch between game and title in stream previews. [#215](https://github.com/streamlink/streamlink-twitch-gui/issues/215)
- Added twitch stream link detection for external links. [#228](https://github.com/streamlink/streamlink-twitch-gui/issues/228)
- Added support for filtering a single language. [#151](https://github.com/streamlink/streamlink-twitch-gui/issues/151)
- Added checkbox to disable smooth scrolling. [#204](https://github.com/streamlink/streamlink-twitch-gui/issues/204)
- Increased size of the search history. [#217](https://github.com/streamlink/streamlink-twitch-gui/issues/217)
- Fixed missing stream titles causing menus to be empty. [#214](https://github.com/streamlink/streamlink-twitch-gui/issues/214)
- Fixed chatty parameters while not being logged in.
- Fixed issues with third party chat applications. [#231](https://github.com/streamlink/streamlink-twitch-gui/issues/231)
- Fixed infinite scroll on unscaled UHD resolutions. [#230](https://github.com/streamlink/streamlink-twitch-gui/issues/230)
- Upgraded to Ember/EmberData 2.4.0 LTS

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.12.0...v0.13.0)


## [v0.12.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.12.0) (2016-02-06)

- Re-implemented the authentication system. [#209](https://github.com/streamlink/streamlink-twitch-gui/issues/209)
- Improved desktop notification failure detection.
- Fixed OSX cmd+r refresh shortcut. [#203](https://github.com/streamlink/streamlink-twitch-gui/issues/203)

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.11.2...v0.12.0)


## [v0.11.2](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.11.2) (2016-01-23)

- Implemented right click context menus. [#180](https://github.com/streamlink/streamlink-twitch-gui/issues/180)
- Implemented additional stream click actions. [#180](https://github.com/streamlink/streamlink-twitch-gui/issues/180)
- Implemented automatic menu refresh on focus regain. [#177](https://github.com/streamlink/streamlink-twitch-gui/issues/177)
- Reworked error handling of desktop notifications. [#176](https://github.com/streamlink/streamlink-twitch-gui/issues/176)
- Added "Audio only" stream quality. [#195](https://github.com/streamlink/streamlink-twitch-gui/issues/195)
- Added always show game option to settings. [#178](https://github.com/streamlink/streamlink-twitch-gui/issues/178)
- Added option for disabling Windows8+ startmenu shortcut creation. [#173](https://github.com/streamlink/streamlink-twitch-gui/issues/173)
- Fixed not being able to refresh menus that failed to load. [#189](https://github.com/streamlink/streamlink-twitch-gui/issues/189)
- Fixed bug causing scrolling to stop working. [#196](https://github.com/streamlink/streamlink-twitch-gui/issues/196)
- Fixed blurry application icon on Linux.

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.11.1...v0.11.2)


## [v0.11.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.11.1) (2015-12-05)

- Implemented channel details.
- Changed details view in stream list items.
- Added OSX refresh shortcut. [#152](https://github.com/streamlink/streamlink-twitch-gui/issues/152)
- Added --max launch parameter. [#161](https://github.com/streamlink/streamlink-twitch-gui/issues/161)
- Added OAuth token variable to custom chat method.
- Added Chatty startscript fallback. [#159](https://github.com/streamlink/streamlink-twitch-gui/issues/159)
- Fixed bug causing certain locations of Chatty to be rejected. [#150](https://github.com/streamlink/streamlink-twitch-gui/issues/150)
- Fixed image preloading system issue.
- Upgraded to Ember/EmberData 2.1.0.

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.11.0...v0.11.1)


## [v0.11.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.11.0) (2015-10-16)

- Implemented theme switcher and added dark theme.
- Implemented menu-related random stream launch button.
- Implemented stream status overlay for stream list items.
- Added notification toggling mechanism to tray icon context menu. [#139](https://github.com/streamlink/streamlink-twitch-gui/issues/139)
- Added Chatty to custom chat methods (requires >=0.8.2b2).
- Added loading spinner and replaced old loading animation.
- Added twitchemotes.com button to channel pages / stream popup (can be enabled in settings). [#143](https://github.com/streamlink/streamlink-twitch-gui/issues/143)
- Fixed subscribe button being visible on all channel pages / popups. [#142](https://github.com/streamlink/streamlink-twitch-gui/issues/142)
- Fixed text of closing modal dialog.

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.10.1...v0.11.0)


## [v0.10.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.10.1) (2015-09-14)

- Fixed livestreamer validation.
- Fixed image preloader.
- Fixed application name in gnome panel. [#136](https://github.com/streamlink/streamlink-twitch-gui/issues/136)

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.10.0...v0.10.1)


## [v0.10.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.10.0) (2015-09-13)

- Implemented multiple chat methods. [#132](https://github.com/streamlink/streamlink-twitch-gui/issues/132)
- Implemented real stream language filters. [#133](https://github.com/streamlink/streamlink-twitch-gui/issues/133)
- Reworked stream popup with better log/warning/error output. [#123](https://github.com/streamlink/streamlink-twitch-gui/issues/123)
- Added stream URL support to the search bar. [#126](https://github.com/streamlink/streamlink-twitch-gui/issues/126)
- Added totals of listed games/channels/streams to various page headers.
- Fixed subscription item background if channel hasn't set one.
- Fixed missing desktop notification icons on Windows.
- Fixed issue regarding player parameters and disabled advanced settings.
- Several bug fixes and improvements.
- Upgraded application to Ember/Ember-Data 2.0.

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.9.3...v0.10.0)


## [v0.9.3](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.9.3) (2015-08-05)

- Fixed livestreamer validation failure on OSX. [#121](https://github.com/streamlink/streamlink-twitch-gui/issues/121)
- Fixed minimize to tray. [#122](https://github.com/streamlink/streamlink-twitch-gui/issues/122)
- Always show chat button on channel pages. [#119](https://github.com/streamlink/streamlink-twitch-gui/issues/119)
- Upgraded to NW.js v0.12.3.

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.9.2...v0.9.3)


## [v0.9.2](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.9.2) (2015-07-31)

- Implemented stream language filters. [#113](https://github.com/streamlink/streamlink-twitch-gui/issues/113)
- Fully implemented the game following feature. [#31](https://github.com/streamlink/streamlink-twitch-gui/issues/31)
- Added sorting options to followed channels.
- Added option to always show stream flags. [#106](https://github.com/streamlink/streamlink-twitch-gui/issues/106)
- Fixed touch issues with dropdown elements. [#108](https://github.com/streamlink/streamlink-twitch-gui/issues/108)
- Upgraded to Ember v1.12.1 and Ember-Data v1.0.0-beta.19.2.
- Upgraded to NW.js v0.12.2.
- Some minor bug fixes and improvements.

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.9.1...v0.9.2)


## [v0.9.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.9.1) (2015-05-27)

- Fixed desktop notifications.
- Added a second livestreamer fallback path on OSX. [#99](https://github.com/streamlink/streamlink-twitch-gui/issues/99)

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.9.0...v0.9.1)


## [v0.9.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.9.0) (2015-05-25)

- Restructured mainmenu (renamed "Your" to "My"):
  - Implemented subscriptions and followed channels+games menus.
  - Removed "Recent activity" and "Most viewed" menu templates (for now).
- Implemented custom livestreamer parameters. [#88](https://github.com/streamlink/streamlink-twitch-gui/issues/88)
- Added livestreamer download/caching settings. [#82](https://github.com/streamlink/streamlink-twitch-gui/issues/82)
- Added Twitch.tv API hiccup detection (prevents notifications of all followed channels).
- Added F5 and Ctrl+R reload shortcuts.
- Added animation effects.
- Fixed stream quality dropdown glitching when closing the stream popup.
- Fixed channel pages not reloading correctly. [#89](https://github.com/streamlink/streamlink-twitch-gui/issues/89)
- Fixed issue with videoplayer parameters. [#94](https://github.com/streamlink/streamlink-twitch-gui/issues/94)
- Upgraded to Ember-Data 1.0.0-beta.17.
- Several bug fixes and improvements.

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.8.0...v0.9.0)


## [v0.8.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.8.0) (2015-04-23)

- Implemented custom channel settings (see the wrench icon in the upper right corner). [#23](https://github.com/streamlink/streamlink-twitch-gui/issues/23), [#63](https://github.com/streamlink/streamlink-twitch-gui/issues/63)
- Implemented channel search function.
- Implemented task bar / dock icon badge showing number of online favorites. [#67](https://github.com/streamlink/streamlink-twitch-gui/issues/67)
- Implemented player command line variables (click the button in the videoplayer settings section).
  Requires advanced settings to be enabled.
- Restructured the settings menu.
- Fixed incorrect OSX tray icon scaling. [#64](https://github.com/streamlink/streamlink-twitch-gui/issues/64)
- Fixed window state persistence when changing the desktop resolution.
- Fixed stream popup overwriting the channel status after a successful stream launch.
- Fixed rare HTMLBars parsing error resulting in a blank page.
- Fixed mousewheel scrolling not working sometimes.
- Upgraded NW.js to v0.12.1 (fixes the HiDPI issues on Windows). [#72](https://github.com/streamlink/streamlink-twitch-gui/issues/72)
- Several minor bug fixes and improvements.

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.7.3...v0.8.0)


## [v0.7.3](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.7.3) (2015-03-29)

- Fixed application being hidden after closing it while being minimized. [#62](https://github.com/streamlink/streamlink-twitch-gui/issues/62)
- Replaced colored tray icons on OSX with grayscale ones.
- Fixed notification click bug where chat was opened twice in some cases.

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.7.2...v0.7.3)


## [v0.7.2](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.7.2) (2015-03-26)

- Implemented channel pages.
- Implemented login via OAuth token. [#53](https://github.com/streamlink/streamlink-twitch-gui/issues/53)  
  Requires "advanced settings" to be enabled (see settings menu).
- Added more infos to the stream popup (refreshes automatically).
- Added `--tray` and `--min` start parameters. [#50](https://github.com/streamlink/streamlink-twitch-gui/issues/50)
- Added minimize to tray option.
- The window state will now be preserved between sessions. [#48](https://github.com/streamlink/streamlink-twitch-gui/issues/48)  
  Use `--reset-window` to start the application centered again.
- Fixed desktop notification bugs.
- Fixed livestreamer default path (OSX). [#55](https://github.com/streamlink/streamlink-twitch-gui/issues/55)
- Fixed broken keyboard shortcuts (OSX). [#59](https://github.com/streamlink/streamlink-twitch-gui/issues/59)
- Upgraded dependencies.
- Upgraded NW.js to v0.12.0.
- Various other bugfixes and improvements.

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.7.1...v0.7.2)


## [v0.7.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.7.1) (2015-02-10)

- Fixed "Launching stream" dialog being stuck in some cases. See [#45](https://github.com/streamlink/streamlink-twitch-gui/issues/45) and [#38](https://github.com/streamlink/streamlink-twitch-gui/issues/38). Thanks @Wraul
- Fixed invalid aspect ratio of broken preview images.
- Restricted start menu shortcut creation on windows to win8 and higher. Required for toast notifications. See [#44](https://github.com/streamlink/streamlink-twitch-gui/issues/44).
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
- Fixed list of followed channels being cut off after the first 12 entries. [#34](https://github.com/streamlink/streamlink-twitch-gui/issues/34)
- Fixed unresolving auto-logins issue.
- Fixed "beta.twitch.tv" stream url issue.
- Fixed osx build issue of the previous release.
- Upgraded to latest stable version of nw.js (node-webkit) v0.11.6.
- Various other bugfixes and improvements.

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.6.1...v0.7.0)


## [v0.6.1](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.6.1) (2014-12-12)

- **Set the required livestreamer version to v1.11.1 !!!** See [#30](https://github.com/streamlink/streamlink-twitch-gui/issues/30)  
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

- Implemented twitch.tv login (due to dependency issues, only the followed channels are currently supported [#27](https://github.com/streamlink/streamlink-twitch-gui/issues/27))
- Improved the infinite scroll logic and stream tile layout
- Implemented twitter name and link parser for stream titles and descriptions
- Reworked internal data querying logic
- Menus can now be refreshed by clicking on the menu again [#18](https://github.com/streamlink/streamlink-twitch-gui/issues/18)
- Fixed issue where OSX was not able to find livestreamer in its default location [#24](https://github.com/streamlink/streamlink-twitch-gui/issues/24)
- Implemented custom homepage [#25](https://github.com/streamlink/streamlink-twitch-gui/issues/25)
- Added app icon to windows build [#26](https://github.com/streamlink/streamlink-twitch-gui/issues/26)
- Updated node-webkit to v0.11.0 (adds support for high-dpi)
- Many other small fixes and improvements

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.5.0...v0.6.0)


## [v0.5.0](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.5.0) (2014-08-19)

- Multi stream support! [#13](https://github.com/streamlink/streamlink-twitch-gui/issues/13)
- The GUI may now be closed while streams are still running
- Implemented livestreamer validation / version check
- Added stream type selection to the settings [#16](https://github.com/streamlink/streamlink-twitch-gui/issues/16)
- Added GUI minimize option when launching a stream [#16](https://github.com/streamlink/streamlink-twitch-gui/issues/16)
- Added a refresh button to the titlebar
- Disabled caching of twitch.tv API requests
- Fixed various infinite scroll bugs
- Fixed missing stream quality fallbacks [#15](https://github.com/streamlink/streamlink-twitch-gui/issues/15)
- Made the error messages a bit more informative
- Added application icon for windows

[Changelog](https://github.com/streamlink/streamlink-twitch-gui/compare/v0.4.2...v0.5.0)


## [v0.4.2](https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v0.4.2) (2014-08-07)

* Added chat button to the "now watching" popup [#9](https://github.com/streamlink/streamlink-twitch-gui/issues/9)
* Added quality change dropdown to the popup [#10](https://github.com/streamlink/streamlink-twitch-gui/issues/10)
* Added "minimize GUI" options
* Integrated a livestreamer download button
* The app window will now correctly appear centered on startup
* Updated node-webkit to v0.10.1
* Windows builds now have improved text rendering
* Gentoo support for Linux startscript [#12](https://github.com/streamlink/streamlink-twitch-gui/issues/12)
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

