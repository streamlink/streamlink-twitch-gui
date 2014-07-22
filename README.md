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
**Please note**: [Livestreamer][Livestreamer] has to be installed on your machine to be able to watch any stream, so please do this *before* starting the application.

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
  [Nodejs]: http://nodejs.org "Node.js"
  [npm]: https://npmjs.org "Node Packaged Modules"
