import main from "root/config/main.json";
import dirs from "root/config/dirs.json";
import files from "!files-from-json!root/config/files.json";
import vars from "root/config/vars.json";
import update from "root/config/update.json";
import themes from "root/config/themes.json";
import langs from "root/config/langs.json";
import livestreamer from "root/config/livestreamer.json";
import twitch from "root/config/twitch.json";
import notification from "root/config/notification.json";
import chat from "root/config/chat.json";


	var config = {};

	config[ "main" ] = main;
	config[ "dirs" ] = dirs;
	config[ "files" ] = files;
	config[ "vars" ] = vars;
	config[ "update" ] = update;
	config[ "themes" ] = themes;
	config[ "langs" ] = langs;
	config[ "livestreamer" ] = livestreamer;
	config[ "twitch" ] = twitch;
	config[ "notification" ] = notification;
	config[ "chat" ] = chat;


	export default config;
