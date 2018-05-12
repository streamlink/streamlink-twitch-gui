[Streamlink Twitch GUI][Website]
===
[![Supported platforms][badge-platforms]][Releases] [![Latest release][badge-release]][Releases] [![Open issues][badge-issues]][Issues] [![Gitter IRC][badge-gitter]][Gitter] [![Build status (Travis CI)][badge-travis]][Travis-CI] [![Build status (Appveyor CI)][badge-appveyor]][Appveyor-CI] [![Code coverage][badge-codecov]][Codecov]

**A multi platform [Twitch.tv][Twitch] browser for [Streamlink][Streamlink]**

[![Streamlink Twitch GUI][Preview]][Releases]


## Livestreamer Twitch GUI has been renamed

*Streamlink Twitch GUI*, previously known as *Livestreamer Twitch GUI*, has been renamed in early december 2016. A comment regarding this change can be found in the thread ["The future of Livestreamer Twitch GUI"][Application-rename].


## Description

A graphical user interface on top of the [Streamlink][Streamlink] command line interface.  

Streamlink Twitch GUI is a [NW.js][NW.js] application, which means that it is a web application written in JavaScript ([EmberJS][EmberJS]), HTML ([Handlebars][Handlebars]) and CSS ([LessCSS][LessCSS]) and is being run by a [Node.js][Node.js] powered version of [Chromium][Chromium].

[Recent releases][Releases] / [Changelog][Changelog] / [Wiki][Wiki] / [Chat][Gitter]


## Features

* Available on Windows, MacOS and Linux
* Supports both Streamlink and Livestreamer
* Browse streams by popularity, game, community or team
* Watch streams in the video player of your choice
* Watch multiple streams at once
* Access your subscriptions and followed channels or games
* Filter streams by channel- or broadcasting language
* Receive desktop notifications when new streams start
* Join the Twitch chat by using customizable chat applications
* Rich settings menu with lots of customizations and presets
* Individual channel settings
* Integrated default and dark themes


## Why

One of the reasons for having bad viewing experiences on [Twitch.tv][Twitch] is the usage of their HTML5 or Flash video player. Especially on mobile desktop devices, high CPU and memory usage and lack of GPU acceleration of the web browser can cause major issues like buffering, stuttering or low video playback frame rates.

With Streamlink Twitch GUI you're not dependent on your web browser and streams can be watched in the video player of your choice, enabling a smooth video playback. In addition to that, variable stream buffers will help you countering bad network conditions.

Please bear in mind that you're bypassing any ads run by Twitch by using this software. If you want to support [Twitch][Twitch] or a single broadcaster, please consider buying [Twitch Prime][TwitchPrime] or subscribing to the broadcaster's channel. Thank you!


## Download

[See the Wiki for detailed installation and configuration instructions.][Wiki]

Streamlink Twitch GUI depends on Streamlink.  
Install [Streamlink][Streamlink] prior to using this application or you won't be able to launch any streams.

#### Archives

[Directly download the application from the github releases page.][Releases]

#### Packages

Chocolatey (Windows):  
[`choco install streamlink-twitch-gui`][Package-Chocolatey]

AUR (Arch Linux):  
[`pacaur -S streamlink-twitch-gui`][Package-AUR]  
[`pacaur -S streamlink-twitch-gui-git`][Package-AUR-git]

Homebrew Cask (MacOS):  
[`brew cask install streamlink-twitch-gui`][Package-Homebrew-Cask]  

Solus:  
[`sudo eopkg install streamlink-twitch-gui`][Package-Eopkg]

#### Development version

If you want to test the latest unreleased version, you can do this by cloning the repository and building the application off the master branch. Further instructions can be found down below or [here][Contributing].  
Please don't forget to report any bugs you may encounter. Thank you very much for helping!


## Build

Building the application on your own is simple. Just make sure that the latest stable versions of [Node.js][Node.js] and [Yarn][yarn] (or [Npm][npm]) are installed on your system.  
Then run the following lines from the path of your cloned repository to install all dependencies and to start the build process. You will then find the built executable inside the `build/releases` folder. See [here][Contributing] for more detailed instructions.

```bash
yarn global add grunt-cli
yarn install
grunt release
```


## Contributing

Every contribution is welcome! Please read [CONTRIBUTING.md][Contributing] first.



  [Preview]: https://user-images.githubusercontent.com/467294/32060296-a08d7b44-ba6e-11e7-9793-8ef60fc3e1f0.jpg "Preview image"
  [Website]: https://streamlink.github.io/streamlink-twitch-gui/ "Streamlink Twitch GUI website"
  [Releases]: https://github.com/streamlink/streamlink-twitch-gui/releases "Streamlink Twitch GUI Releases"
  [Issues]: https://github.com/streamlink/streamlink-twitch-gui/issues "Streamlink Twitch GUI Issues"
  [Wiki]: https://github.com/streamlink/streamlink-twitch-gui/wiki "Streamlink Twitch GUI Wiki"
  [Travis-CI]: https://travis-ci.org/streamlink/streamlink-twitch-gui "Travis CI"
  [Appveyor-CI]: https://ci.appveyor.com/project/bastimeyer/streamlink-twitch-gui "Appveyor CI"
  [Codecov]: https://codecov.io/gh/streamlink/streamlink-twitch-gui "Codecov"
  [Gitter]: https://gitter.im/streamlink/streamlink-twitch-gui "Gitter IRC"
  [Contributing]: https://github.com/streamlink/streamlink-twitch-gui/blob/master/CONTRIBUTING.md
  [Changelog]: https://github.com/streamlink/streamlink-twitch-gui/blob/master/CHANGELOG.md
  [Streamlink]: https://github.com/streamlink/streamlink "Streamlink"
  [Twitch]: https://twitch.tv "Twitch.tv"
  [TwitchPrime]: https://twitch.amazon.com/prime "Twitch Prime"
  [NW.js]: https://github.com/nwjs/nw.js "NW.js"
  [EmberJS]: http://emberjs.com/ "EmberJS"
  [Handlebars]: http://handlebarsjs.com/ "Handlebars.js"
  [LessCSS]: http://lesscss.org/ "LessCSS"
  [Chromium]: https://www.chromium.org/ "Chromium"
  [Microsoft Visual C++ 2008 Redistributable Package]: http://www.microsoft.com/en-us/download/details.aspx?id=29 "Microsoft Visual C++ 2008 Redistributable Package"
  [Installation package]: https://streamlink.github.io/install.html#windows-binaries "Streamlink installation package"
  [Node.js]: https://nodejs.org "Node.js"
  [yarn]: https://yarnpkg.com "Fast, reliable, and secure dependency management."
  [npm]: https://npmjs.org "Node Packaged Modules"
  [badge-platforms]: https://img.shields.io/badge/platform-win%20%7C%20mac%20%7C%20linux-green.svg?style=flat-square "Supported platforms"
  [badge-release]: https://img.shields.io/github/release/streamlink/streamlink-twitch-gui.svg?style=flat-square "Latest release"
  [badge-issues]: https://img.shields.io/github/issues/streamlink/streamlink-twitch-gui.svg?style=flat-square "Open issues"
  [badge-travis]: https://img.shields.io/travis/streamlink/streamlink-twitch-gui.svg?style=flat-square
  [badge-appveyor]: https://img.shields.io/appveyor/ci/bastimeyer/streamlink-twitch-gui.svg?style=flat-square
  [badge-codecov]: https://img.shields.io/codecov/c/github/streamlink/streamlink-twitch-gui.svg?style=flat-square
  [badge-gitter]: https://img.shields.io/gitter/room/streamlink/streamlink-twitch-gui.svg?style=flat-square "Gitter IRC"
  [Package-Chocolatey]: https://chocolatey.org/packages/streamlink-twitch-gui "Chocolatey package"
  [Package-AUR]: https://aur.archlinux.org/packages/streamlink-twitch-gui "AUR stable package"
  [Package-AUR-git]: https://aur.archlinux.org/packages/streamlink-twitch-gui-git "AUR git package"
  [Package-Eopkg]: https://dev.solus-project.com/source/streamlink-twitch-gui/ "Solus eopkg package"
  [Package-Homebrew-Cask]: https://caskroom.github.io/
  [Application-rename]: https://github.com/streamlink/streamlink-twitch-gui/issues/331 "The future of Livestreamer Twitch GUI"
