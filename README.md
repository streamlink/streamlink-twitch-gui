Livestreamer Twitch GUI
===
[![Supported platforms][badge-platforms]][Releases] [![Latest release][badge-release]][Releases] [![Open issues][badge-issues]][Issues] [![Gitter IRC][badge-gitter]][Gitter]

**A multi platform [Twitch.tv][Twitch] browser for [Livestreamer][Livestreamer]**

[![Livestreamer Twitch GUI][Preview]][Releases]


## Description

This is just a graphical user interface (GUI) on top of the [Livestreamer][Livestreamer] command line interface (CLI).  

Livestreamer Twitch GUI is a [NW.js][NW.js] application, which means that it is a web application written in JavaScript ([EmberJS][EmberJS]), HTML ([Handlebars][Handlebars]) and CSS ([LessCSS][LessCSS]) and is being run by a [Node.js][Node.js] powered version of [Chromium][Chromium].

[Recent releases][Releases] / [Changelog][Changelog] / [Wiki][Wiki] / [Chat][Gitter]


## Features

* Available for Windows, OSX and Linux (for both x86 and x64)
* Browse streams by popularity or by different games
* Watch multiple streams at once
* Customizable settings like video players, stream types, stream bufferings and much more
* Customizable channel settings
* Integrated Twitch.tv login with access to subscriptions and followed channels and games
* Follow your favorite channels and games
* Desktop notifications
* Multiple chat methods
* Stream language filters


## Why

One of the reasons people are having bad viewing experiences on [Twitch.tv][Twitch] is the usage of the flash player on their website. With the current generation of web browsers they sadly almost don't have any other choice but using flash for delivering a simple streaming service. There are some platforms and configurations where flash is causing problems though. These problems are low frame rates when watching streams or videos and also the lack of GPU acceleration leading to high CPU + memory usage which can be a big issue especially for mobile desktop devices.  
With Livestreamer Twitch GUI you're not dependent on your browser and flash, so fewer resources are needed. Also all streams can be watched in the video player of your choice, enabling a smooth video playback.  
Please have in mind, that by using this application you're bypassing any ads run by Twitch (adblock users also do). If you want to support [Twitch][Twitch] or a single broadcaster, please consider buying [Twitch Turbo][TwitchTurbo] or subscribing to the broadcaster's channel. Thank you!


## Download

#### Direct download

[Directly download the application from the github releases page.][Releases]  
More informations and installation instructions can be found in the project's [Wiki][Wiki]!!!

#### Packages

Chocolatey (Windows):  
[`livestreamer-twitch-gui`][Package-Chocolatey]

AUR (Arch Linux):  
[`livestreamer-twitch-gui`][Package-AUR]  
[`livestreamer-twitch-gui-git`][Package-AUR-git]

Homebrew Cask (OS X):  
[`brew cask install livestreamer-twitch-gui`][Package-Homebrew-cask]  

#### Development version

If you want to test the latest unreleased version, you can do this by cloning the repository and building the application off the master branch. Further instructions can be found down below or [here][Contributing].  
Please don't forget to report any bugs you may encounter. Thank you very much for helping!

#### Notes

**Caution**: Livestreamer Twitch GUI depends on Livestreamer. Install [Livestreamer][Livestreamer] prior to using this application or you won't be able to launch any streams.

**Windows users**: Do not install Livestreamer via pip. Instead, use the [installation package][Installation package] (requires [Microsoft Visual C++ 2008 Redistributable Package][Microsoft Visual C++ 2008 Redistributable Package]).


## Build

Building the application on your own is simple. Just make sure that the latest stable version of [Node.js][Node.js] (including [npm][npm]) is installed on your machine.  
Then run the following lines from the path of your cloned repository to install all dependencies and to start the build process. You will then find the built executable inside the `build/releases` folder.

```bash
npm install -g grunt-cli bower # may require administrator privileges
npm install
grunt release
```


## Contributing

Every contribution is welcome! Please read [CONTRIBUTING.md][Contributing] first.



  [Preview]: https://cloud.githubusercontent.com/assets/467294/9153558/c14cdfa2-3e5e-11e5-87b3-982188dc5d3c.png "Preview image"
  [Releases]: https://github.com/bastimeyer/livestreamer-twitch-gui/releases "Livestreamer Twitch GUI Releases"
  [Issues]: https://github.com/bastimeyer/livestreamer-twitch-gui/issues "Livestreamer Twitch GUI Issues"
  [Wiki]: https://github.com/bastimeyer/livestreamer-twitch-gui/wiki "Livestreamer Twitch GUI Wiki"
  [Gitter]: https://gitter.im/bastimeyer/livestreamer-twitch-gui "Gitter IRC"
  [Contributing]: https://github.com/bastimeyer/livestreamer-twitch-gui/blob/master/CONTRIBUTING.md
  [Changelog]: https://github.com/bastimeyer/livestreamer-twitch-gui/blob/master/CHANGELOG.md
  [Livestreamer]: https://github.com/chrippa/livestreamer "Livestreamer"
  [Twitch]: http://twitch.tv "Twitch.tv"
  [TwitchTurbo]: http://twitch.tv/products/turbo "Twitch Turbo"
  [NW.js]: https://github.com/nwjs/nw.js "NW.js"
  [EmberJS]: http://emberjs.com/ "EmberJS"
  [Handlebars]: http://handlebarsjs.com/ "Handlebars.js"
  [LessCSS]: http://lesscss.org/ "LessCSS"
  [Chromium]: https://www.chromium.org/ "Chromium"
  [Microsoft Visual C++ 2008 Redistributable Package]: http://www.microsoft.com/en-us/download/details.aspx?id=29 "Microsoft Visual C++ 2008 Redistributable Package"
  [Installation package]: http://docs.livestreamer.io/install.html#windows-binaries "Livestreamer installation package"
  [Node.js]: https://nodejs.org "Node.js"
  [npm]: https://npmjs.org "Node Packaged Modules"
  [badge-platforms]: https://img.shields.io/badge/platform-win%20%7C%20osx%20%7C%20linux-green.svg?style=flat-square "Supported platforms"
  [badge-release]: https://img.shields.io/github/release/bastimeyer/livestreamer-twitch-gui.svg?style=flat-square "Latest release"
  [badge-issues]: https://img.shields.io/github/issues/bastimeyer/livestreamer-twitch-gui.svg?style=flat-square "Open issues"
  [badge-gitter]: https://img.shields.io/gitter/room/bastimeyer/livestreamer-twitch-gui.svg?style=flat-square "Gitter IRC"
  [Package-Chocolatey]: https://chocolatey.org/packages/livestreamer-twitch-gui "Chocolatey package"
  [Package-AUR]: https://aur.archlinux.org/packages/livestreamer-twitch-gui "AUR stable package"
  [Package-AUR-git]: https://aur.archlinux.org/packages/livestreamer-twitch-gui-git "AUR git package"
  [Package-Homebrew-cask]: https://caskroom.github.io/
