Livestreamer Twitch GUI
===

**A graphical user interface for [Livestreamer][Livestreamer] to browse [Twitch.tv][Twitch] streams**

[ ![Livestreamer Twitch GUI][Preview] ][Releases]

This is a [node-webkit][NodeWebkit] application, which means it is written in JavaScript, HTML and CSS (Lesscss).

---

## Description

As the title already says, this is just a GUI on top of the [Livestreamer][Livestreamer] CLI application.
There are still some core features missing at the current stage of development, but the most important parts are working fine.

---

## Download

[Here you can find the list of all recent releases.][Releases]

**Please note**: Livestreamer Twitch GUI depends on Livestreamer. Install [Livestreamer][Livestreamer] prior to using Livestreamer Twitch GUI.

**Windows users**: Do not install Livestreamer via pip. Instead, install the [Microsoft Visual C++ 2008 Redistributable Package][Microsoft Visual C++ 2008 Redistributable Package], then install Livestreamer via its [installation package][installation package].

---

## Build

To build this application on your own, make sure you have installed the latest version of [Node.js][Nodejs] (including [npm][npm]).
Then just run these lines to install all dependencies and start the build process.
You will then find the built executable inside the `build/releases` folder.

```bash
npm install -g grunt-cli bower # may require administrator privileges
npm install
grunt release
```

---

## Contributing

Every contribution is welcome! Please read [CONTRIBUTING.md][Contributing] first.



  [Preview]: https://cloud.githubusercontent.com/assets/467294/3655974/53894240-1181-11e4-9605-1b8f058f9420.png "Preview image"
  [Releases]: https://github.com/bastimeyer/livestreamer-twitch-gui/releases "Livestreamer Twitch GUI Releases"
  [Contributing]: https://github.com/bastimeyer/livestreamer-twitch-gui/blob/master/CONTRIBUTING.md
  [Livestreamer]: https://github.com/chrippa/livestreamer "Livestreamer"
  [Twitch]: http://twitch.tv "Twitch.tv"
  [NodeWebkit]: https://github.com/rogerwang/node-webkit "Node-Webkit"
  [Microsoft Visual C++ 2008 Redistributable Package]: http://www.microsoft.com/en-us/download/details.aspx?id=29 "Microsoft Visual C++ 2008 Redistributable Package"
  [installation package]: http://livestreamer.tanuki.se/en/latest/install.html#windows-binaries "Livestreamer installation package"
  [Nodejs]: http://nodejs.org "Node.js"
  [npm]: https://npmjs.org "Node Packaged Modules"
