import attr from "ember-data/attr";
import Fragment from "ember-data-model-fragments/fragment";


export const ATTR_STREAMS_NAME_CUSTOM = 1;
export const ATTR_STREAMS_NAME_ORIGINAL = 2;
export const ATTR_STREAMS_NAME_BOTH = ATTR_STREAMS_NAME_CUSTOM | ATTR_STREAMS_NAME_ORIGINAL;

export const ATTR_STREAMS_INFO_GAME = 0;
export const ATTR_STREAMS_INFO_TITLE = 1;

export const ATTR_STREAMS_CLICK_NOOP = 0;
export const ATTR_STREAMS_CLICK_LAUNCH = 1;
export const ATTR_STREAMS_CLICK_CHAT = 2;
export const ATTR_STREAMS_CLICK_CHANNEL = 3;
export const ATTR_STREAMS_CLICK_SETTINGS = 4;

export const ATTR_FILTER_LANGUAGES_NOOP = 0;
export const ATTR_FILTER_LANGUAGES_FADE = 1;
export const ATTR_FILTER_LANGUAGES_FILTER = 2;

// eslint-disable-next-line max-len
export const DEFAULT_VODCAST_REGEXP = "\\b(not live|re-?(run|streaming)|(vod-?|re-?broad)cast(ing)?)\\b";


export default Fragment.extend({
	name: attr( "number", { defaultValue: ATTR_STREAMS_NAME_BOTH } ),

	modal_close_end: attr( "boolean", { defaultValue: false } ),
	modal_close_launch: attr( "boolean", { defaultValue: false } ),

	chat_open: attr( "boolean", { defaultValue: false } ),
	chat_open_context: attr( "boolean", { defaultValue: false } ),
	twitchemotes: attr( "boolean", { defaultValue: false } ),

	filter_vodcast: attr( "boolean", { defaultValue: true } ),
	vodcast_regexp: attr( "string", { defaultValue: "" } ),

	filter_languages: attr( "number", { defaultValue: ATTR_FILTER_LANGUAGES_NOOP } ),
	language: attr( "string", { defaultValue: "en" } ),

	show_flag: attr( "boolean", { defaultValue: false } ),
	show_info: attr( "boolean", { defaultValue: false } ),
	info: attr( "number", { defaultValue: ATTR_STREAMS_INFO_TITLE } ),
	uptime_hours_only: attr( "boolean", { defaultValue: false } ),

	click_middle: attr( "number", { defaultValue: ATTR_STREAMS_CLICK_CHAT } ),
	click_modify: attr( "number", { defaultValue: ATTR_STREAMS_CLICK_SETTINGS } )

}).reopenClass({

	contentName: [
		{ id: ATTR_STREAMS_NAME_BOTH, label: "both" },
		{ id: ATTR_STREAMS_NAME_CUSTOM, label: "custom" },
		{ id: ATTR_STREAMS_NAME_ORIGINAL, label: "original" }
	],

	filterLanguages: [
		{ id: ATTR_FILTER_LANGUAGES_NOOP, label: "noop" },
		{ id: ATTR_FILTER_LANGUAGES_FADE, label: "fade" },
		{ id: ATTR_FILTER_LANGUAGES_FILTER, label: "filter" }
	],

	info: [
		{ id: ATTR_STREAMS_INFO_GAME, label: "game" },
		{ id: ATTR_STREAMS_INFO_TITLE, label: "title" }
	],

	click: [
		{ id: ATTR_STREAMS_CLICK_NOOP, label: "noop" },
		{ id: ATTR_STREAMS_CLICK_LAUNCH, label: "launch" },
		{ id: ATTR_STREAMS_CLICK_CHAT, label: "chat" },
		{ id: ATTR_STREAMS_CLICK_CHANNEL, label: "channel" },
		{ id: ATTR_STREAMS_CLICK_SETTINGS, label: "settings" }
	]
});
