<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://schemas.microsoft.com/packaging/2010/07/nuspec.xsd">
  <metadata>
    <id>livestreamer-twitch-gui</id>
    <title><%= name %></title>
    <version><%= version %></version>
    <authors><%= author %></authors>
    <owners>Sebastian Meyer, Scott Walters</owners>
    <summary>A multi platform Twitch.tv browser for Livestreamer</summary>
    <description>This app is just a graphical user interface (GUI) on top of the [Livestreamer][Livestreamer] command line interface (CLI).

There are still some features missing at the current stage of development, but the most important ones are working fine.

Livestreamer Twitch GUI is a [NW.js (formerly Node-Webkit)][NW.js] application, which means that it is a web application written in JavaScript ([EmberJS][EmberJS]), HTML ([Handlebars][Handlebars]) and CSS ([LessCSS][LessCSS]) and is being run by an [io.js][io.js] (fork of [Node.js][Node.js]) powered version of [Chromium][Chromium].

#### Package parameters

* `/Purge` - (uninstall) delete appdata and cache folders upon install

Example: `choco uninstall livestreamer-twitch-gui -y -params '"/Purge"'`

  [Livestreamer]: https://github.com/chrippa/livestreamer "Livestreamer"
  [NW.js]: https://github.com/nwjs/nw.js "NW.js"
  [EmberJS]: http://emberjs.com/ "EmberJS"
  [Handlebars]: http://handlebarsjs.com/ "Handlebars.js"
  [LessCSS]: http://lesscss.org/ "LessCSS"
  [io.js]: https://iojs.org "io.js"
  [Node.js]: https://nodejs.org "Node.js"
  [Chromium]: https://www.chromium.org/ "Chromium"
    </description>
    <projectUrl><%= homepage %></projectUrl>
    <packageSourceUrl>https://github.com/bastimeyer/livestreamer-twitch-gui</packageSourceUrl>
    <tags>livestreamer twitch gui streaming</tags>
    <copyright>Sebastian Meyer</copyright>
    <licenseUrl>https://github.com/bastimeyer/livestreamer-twitch-gui/blob/master/LICENSE</licenseUrl>
    <docsUrl>https://github.com/bastimeyer/livestreamer-twitch-gui/wiki</docsUrl>
    <bugTrackerUrl>https://github.com/bastimeyer/livestreamer-twitch-gui/issues</bugTrackerUrl>
    <requireLicenseAcceptance>false</requireLicenseAcceptance>
    <iconUrl>https://cdn.rawgit.com/bastimeyer/livestreamer-twitch-gui/master/src/img/icon-256.png</iconUrl>
    <dependencies>
      <dependency id="livestreamer" version="1.12.2"/>
    </dependencies>
    <releaseNotes><%= releaseNotes %></releaseNotes>
  </metadata>
</package>
