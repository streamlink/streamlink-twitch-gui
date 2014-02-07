Livestreamer Twitch GUI
===

**A graphical user interface for [Livestreamer][Livestreamer] to browse [Twitch.tv][Twitch] streams**

[ ![Livestreamer Twitch GUI][Preview] ][Releases]

This is a [node-webkit][NodeWebkit] application, which means it is written in JavaScript, HTML and CSS (Lesscss).

---

## Description

As the title already says, this is just a GUI on top of the [Livestreamer][Livestreamer] application.
So if livestreamer is not installed on your system, you won't be able to watch streams at all.
There are still some core features missing at the current stage of development, but simple browsing and watching streams is working fine.

---

## Build

To build this application on your own, make sure you have installed the latest version of [Node.js][Nodejs] (including [npm][npm]).
Then just run these lines to install all dependencies and start the build process.
You will then find the built executable inside the `/build/releases` folder.

```
npm install -g grunt-cli bower # may require administrator privileges
npm install
bower install
grunt build
```



  [Preview]: https://f.cloud.github.com/assets/467294/1742953/14df2d72-6405-11e3-983b-60c44306e2b8.png "Preview image"
  [Releases]: https://github.com/bastimeyer/livestreamer-twitch-gui/releases "Livestreamer Twitch GUI Releases"
  [Livestreamer]: https://github.com/chrippa/livestreamer "Livestreamer"
  [Twitch]: http://twitch.tv "Twitch.tv"
  [NodeWebkit]: https://github.com/rogerwang/node-webkit "Node-Webkit"
  [Nodejs]: https://nodejs.org "Node.js"
  [npm]: https://npmjs.org "Node Packaged Modules"
