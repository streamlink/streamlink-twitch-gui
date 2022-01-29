[Streamlink Twitch GUI][Website]
===
[![Supported platforms][badge-platforms]][Releases] [![Latest release][badge-release]][Releases] [![Open issues][badge-issues]][Issues] [![Gitter IRC][badge-gitter]][Gitter] [![Build status][badge-actions]][Github-actions] [![Code coverage][badge-codecov]][Codecov]

**A multi-platform [Twitch.tv][Twitch] browser for [Streamlink][Streamlink]**

[![Streamlink Twitch GUI][Preview]][Releases]


## ℹ️ Description

A graphical user interface on top of the [Streamlink][Streamlink] command line interface.

Streamlink Twitch GUI is an [NW.js][NW.js] application, which means that it is a web application written in JavaScript ([EmberJS][EmberJS]), HTML ([Handlebars][Handlebars]) and CSS ([LessCSS][LessCSS]) and is being run by a [Node.js][Node.js] powered version of [Chromium][Chromium].

[Recent releases][Releases] / [Changelog][Changelog] / [Wiki][Wiki] / [Chat][Gitter]


## 👍 Features

* Available on Windows, macOS and Linux
* Watch streams in the video player of your choice via Streamlink
* Watch multiple streams at once
* Browse streams by popularity, game, channel or team
* Access your followed streams and channels
* Filter streams by channel- or broadcasting language
* Receive desktop notifications when new streams start
* Join the Twitch chat by using customizable chat applications
* Rich settings menu with lots of customizations and presets
* Individual channel settings
* Available in multiple languages
* Automatic or custom selection of light and dark themes
* Customizable hotkeys
* Command line parameters for automation purposes


## 💡 Why

One of the reasons for having bad viewing experiences on [Twitch.tv][Twitch] is the implementation of their resource-heavy website and HTML5 video player. Especially on mobile desktop devices, high CPU and memory usage and lack of GPU acceleration of the web browser can cause major issues like buffering, stuttering or low video playback frame rates, all while draining the device's battery and spinning up its fans. Even on desktop computers, watching streams on Twitch.tv while multi-tasking can be an issue.

With Streamlink Twitch GUI, you're not dependent on your web browser and streams can be watched in the video player of your choice, enabling a smooth video playback. Depending on your choice of player, additional features become available, like for example timeshift support or resolution/framerate upscaling. In addition to that, Streamlink's variable stream buffers will help you countering bad network conditions or reducing the stream's latency even further.

Please bear in mind that you're bypassing any ads run by Twitch by using this software. If you want to support [Twitch][Twitch] or a single broadcaster, please consider buying [Twitch Prime][TwitchPrime] or subscribing to the broadcaster's channel. Thank you!


## 📦 Download

### Stable release

[**Visit the project's wiki**][Wiki] for detailed installation and configuration guides, or just see the [GitHub releases][Releases] page if you don't need help. The wiki also includes a list of supported packages for your platform.

Please remember that **Streamlink Twitch GUI**, as the name already suggests, is only a graphical user interface (GUI) built on top of the **Streamlink** command line interface (CLI). This means that [Streamlink][Streamlink] has to be installed on your system in order to be able to launch streams. Once again, see the [wiki][Wiki] if you need help, as it also covers installing Streamlink.

### Development version

Pre-built debug builds for all supported operating systems are [available to download from the nightly Github actions runs][Nightly builds]. Downloading build artifacts requires a Github account.

If you want to test the latest version on your own, you can do this by cloning the repository and building the application off the master branch. Further instructions can be found down below or in [CONTRIBUTING.md][Contributing].

Please don't forget to report any bugs you may encounter. Thank you very much for helping!


## 🔨 Build

Building the application on your own is simple. Just make sure that the latest stable versions of [Git][Git], [Node.js][Node.js] and [Yarn][yarn] are installed on your system.  
Then run the following lines to clone the repository, to install all dependencies and to start the build process. You will then find the built application inside the `build/releases` folder. See [CONTRIBUTING.md][Contributing] for more detailed instructions.

```bash
git clone https://github.com/streamlink/streamlink-twitch-gui.git
cd streamlink-twitch-gui
yarn install
yarn run grunt release
```


## 🤝 Contribute

Every contribution is welcome! Please read [CONTRIBUTING.md][Contributing] first.

Do you speak another language? Translating or improving translations is a good and simple way of helping and contributing to the project.  
Please see the [Translating][Translating] section on the wiki for all the necessary informations and the beginner's translating guide.


## ❤️ Support

If you think that Streamlink Twitch GUI is useful and if you want to keep the project alive, then please consider supporting its creator/maintainer by sending a small and optionally recurring tip via the available options listed below.  
Your support is very much appreciated, thank you!

* [GitHub Sponsors](https://github.com/users/bastimeyer/sponsorship)
* [Paypal](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YUCGRLVALHS8C&item_name=Streamlink%20Twitch%20GUI)
* [Paypal.me](https://paypal.me/bastimeyer123)
* [Bitcoin](https://blockchain.info/qr?data=1EZg8eBz4RdPb8pEzYD9JEzr9Fyitzj8j8) (`1EZg8eBz4RdPb8pEzYD9JEzr9Fyitzj8j8`)


  [Preview]: https://user-images.githubusercontent.com/467294/151660267-97a8c0a3-62b3-4aa5-b960-c307da1b4fb2.png "Preview image"
  [Website]: https://streamlink.github.io/streamlink-twitch-gui/ "Streamlink Twitch GUI website"
  [Releases]: https://github.com/streamlink/streamlink-twitch-gui/releases "Streamlink Twitch GUI Releases"
  [Issues]: https://github.com/streamlink/streamlink-twitch-gui/issues "Streamlink Twitch GUI Issues"
  [Wiki]: https://github.com/streamlink/streamlink-twitch-gui/wiki "Streamlink Twitch GUI Wiki"
  [Github-actions]: https://github.com/streamlink/streamlink-twitch-gui/actions?query=event%3Apush "Github actions"
  [Codecov]: https://codecov.io/gh/streamlink/streamlink-twitch-gui "Codecov"
  [Gitter]: https://gitter.im/streamlink/streamlink-twitch-gui "Gitter IRC"
  [Contributing]: https://github.com/streamlink/streamlink-twitch-gui/blob/master/CONTRIBUTING.md
  [Translating]: https://github.com/streamlink/streamlink-twitch-gui/wiki/Translating "Translating Wiki page"
  [Changelog]: https://github.com/streamlink/streamlink-twitch-gui/blob/master/CHANGELOG.md
  [Streamlink]: https://streamlink.github.io/ "Streamlink"
  [Twitch]: https://twitch.tv "Twitch.tv"
  [TwitchPrime]: https://twitch.amazon.com/prime "Twitch Prime"
  [NW.js]: https://github.com/nwjs/nw.js "NW.js"
  [EmberJS]: http://emberjs.com/ "EmberJS"
  [Handlebars]: http://handlebarsjs.com/ "Handlebars.js"
  [LessCSS]: http://lesscss.org/ "LessCSS"
  [Chromium]: https://www.chromium.org/ "Chromium"
  [Microsoft Visual C++ 2008 Redistributable Package]: http://www.microsoft.com/en-us/download/details.aspx?id=29 "Microsoft Visual C++ 2008 Redistributable Package"
  [Installation package]: https://streamlink.github.io/install.html#windows-binaries "Streamlink installation package"
  [Nightly builds]: https://github.com/streamlink/streamlink-twitch-gui/actions?query=is%3Asuccess+event%3Aschedule+workflow%3A%22Test%2C+build+and+deploy%22
  [Git]: https://git-scm.com "Git"
  [Node.js]: https://nodejs.org "Node.js"
  [yarn]: https://classic.yarnpkg.com/lang/en/ "Fast, reliable, and secure dependency management."
  [badge-platforms]: https://img.shields.io/badge/platform-win%20%7C%20mac%20%7C%20linux-green.svg?style=flat-square "Supported platforms"
  [badge-release]: https://img.shields.io/github/release/streamlink/streamlink-twitch-gui.svg?style=flat-square "Latest release"
  [badge-issues]: https://img.shields.io/github/issues/streamlink/streamlink-twitch-gui.svg?style=flat-square "Open issues"
  [badge-actions]: https://img.shields.io/github/workflow/status/streamlink/streamlink-twitch-gui/Test,%20build%20and%20deploy/master?event=push&style=flat-square
  [badge-codecov]: https://img.shields.io/codecov/c/github/streamlink/streamlink-twitch-gui.svg?style=flat-square
  [badge-gitter]: https://img.shields.io/gitter/room/streamlink/streamlink-twitch-gui.svg?style=flat-square "Gitter IRC"
