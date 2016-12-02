<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://schemas.microsoft.com/packaging/2010/07/nuspec.xsd">
  <metadata>
    <id>streamlink-twitch-gui</id>
    <title><%= name %></title>
    <version><%= version %></version>
    <authors><%= author %></authors>
    <owners>Sebastian Meyer, Scott Walters</owners>
    <summary>A multi platform Twitch.tv browser for Streamlink</summary>
    <description>This is a graphical user interface (GUI) on top of the [Streamlink][Streamlink] command line interface (CLI).

Streamlink Twitch GUI is a [NW.js][NW.js] application, which means that it is a web application written in JavaScript ([EmberJS][EmberJS]), HTML ([Handlebars][Handlebars]) and CSS ([LessCSS][LessCSS]) and is being run by a [Node.js][Node.js] powered version of [Chromium][Chromium].

#### Package parameters

* `/Purge` - (uninstall) delete appdata and cache folders upon install

Example: `choco uninstall streamlink-twitch-gui -y -params '"/Purge"'`

  [Streamlink]: https://github.com/streamlink/streamlink "Streamlink"
  [NW.js]: https://github.com/nwjs/nw.js "NW.js"
  [EmberJS]: http://emberjs.com/ "EmberJS"
  [Handlebars]: http://handlebarsjs.com/ "Handlebars.js"
  [LessCSS]: http://lesscss.org/ "LessCSS"
  [Node.js]: https://nodejs.org "Node.js"
  [Chromium]: https://www.chromium.org/ "Chromium"
    </description>
    <projectUrl><%= homepage %></projectUrl>
    <packageSourceUrl>https://github.com/streamlink/streamlink-twitch-gui</packageSourceUrl>
    <tags>streamlink twitch gui livestreamer streaming</tags>
    <copyright>Sebastian Meyer</copyright>
    <licenseUrl>https://github.com/streamlink/streamlink-twitch-gui/blob/master/LICENSE</licenseUrl>
    <docsUrl>https://github.com/streamlink/streamlink-twitch-gui/wiki</docsUrl>
    <bugTrackerUrl>https://github.com/streamlink/streamlink-twitch-gui/issues</bugTrackerUrl>
    <requireLicenseAcceptance>false</requireLicenseAcceptance>
    <iconUrl>https://cdn.rawgit.com/streamlink/streamlink-twitch-gui/master/src/img/icon-256.png</iconUrl>
    <dependencies>
      <dependency id="livestreamer" version="1.12.2"/>
    </dependencies>
    <releaseNotes><%= changelog %></releaseNotes>
  </metadata>
</package>
