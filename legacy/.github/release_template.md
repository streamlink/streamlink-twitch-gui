[<%= display_name %>](<%= homepage %>)
===

## 🎉 Release highlights (v<%= version %>)

<%= changelog %>

## ⚙️ Installation and Configuration

See [the project's wiki](https://github.com/streamlink/streamlink-twitch-gui/wiki) for detailed installation and configuration guides.

<% if ( donation && donation.length ) { %>
## ❤️ Support

If you think that Streamlink Twitch GUI is useful and if you want to keep the project alive, then please consider supporting its creator/maintainer by sending a small and optionally recurring tip via the available options listed below.  
Your support is very much appreciated, thank you!

<% JSON.parse( donation ).forEach(function( item ) { %>* [<%= item.text %>](<%= item.url %>)<% if ( item.coinaddress ) { %> (`<%= item.coinaddress %>`)<% } %>
<% }) %>
<% } %>
