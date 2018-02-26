import attr from "ember-data/attr";
import Fragment from "ember-data-model-fragments/fragment";
import { fragment } from "ember-data-model-fragments/attributes";


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

	filter_languages: attr( "boolean", { defaultValue: false } ),
	languages: fragment( "settingsStreamsLanguages", { defaultValue: {} } ),

	show_flag: attr( "boolean", { defaultValue: false } ),
	show_info: attr( "boolean", { defaultValue: false } ),
	info: attr( "number", { defaultValue: ATTR_STREAMS_INFO_TITLE } ),

	click_middle: attr( "number", { defaultValue: ATTR_STREAMS_CLICK_CHAT } ),
	click_modify: attr( "number", { defaultValue: ATTR_STREAMS_CLICK_SETTINGS } )

}).reopenClass({

	contentName: [
		{ id: ATTR_STREAMS_NAME_BOTH, label: "Show both" },
		{ id: ATTR_STREAMS_NAME_CUSTOM, label: "Show custom names" },
		{ id: ATTR_STREAMS_NAME_ORIGINAL, label: "Show original names" }
	],

	filterLanguages: [
		{
			id: false,
			label: {
				text: "Fade out streams",
				description: "Show all streams, fade out ones not matching the language selection."
			}
		},
		{
			id: true,
			label: {
				text: "Filter out streams",
				description: "Only show streams matching the language selection."
			}
		}
	],

	info: [
		{ id: ATTR_STREAMS_INFO_GAME, label: "Game being played" },
		{ id: ATTR_STREAMS_INFO_TITLE, label: "Stream title" }
	],

	click: [
		{ id: ATTR_STREAMS_CLICK_NOOP, key: "disabled", label: "Do nothing" },
		{ id: ATTR_STREAMS_CLICK_LAUNCH, key: "launch", label: "Launch stream" },
		{ id: ATTR_STREAMS_CLICK_CHAT, key: "chat", label: "Open chat" },
		{ id: ATTR_STREAMS_CLICK_CHANNEL, key: "channel", label: "Go to channel page" },
		{ id: ATTR_STREAMS_CLICK_SETTINGS, key: "settings", label: "Go to channel settings" }
	]
});
