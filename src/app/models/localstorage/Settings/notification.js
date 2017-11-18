import { attr } from "ember-data";
import { Fragment } from "model-fragments";


export const ATTR_NOTIFY_CLICK_NOOP = 0;
export const ATTR_NOTIFY_CLICK_FOLLOWED = 1;
export const ATTR_NOTIFY_CLICK_STREAM = 2;
export const ATTR_NOTIFY_CLICK_STREAMANDCHAT = 3;


export default Fragment.extend({
	enabled: attr( "boolean", { defaultValue: true } ),
	provider: attr( "string", { defaultValue: "auto" } ),
	filter: attr( "boolean", { defaultValue: true } ),
	filter_vodcasts: attr( "boolean", { defaultValue: true } ),
	grouping: attr( "boolean", { defaultValue: true } ),
	click: attr( "number", { defaultValue: 1 } ),
	click_group: attr( "number", { defaultValue: 1 } ),
	click_restore: attr( "boolean", { defaultValue: true } ),
	badgelabel: attr( "boolean", { defaultValue: true } )

}).reopenClass({

	providers: [
		{
			value: "auto",
			label: {
				name: "Automatic selection",
				description: "Tries to find the best notification provider",
				notes: "Tests all available notification providers in descending order"
			}
		},
		{
			value: "native",
			label: {
				name: "Native notifications",
				description: "Uses the system's native notification system",
				notes: "Notifications can be configured in the system preferences"
			}
		},
		{
			value: "snoretoast",
			label: {
				name: "Windows toast notifications",
				description: "Native notifications on Windows 8+",
				notes: "\"Banner notifications\" need to be enabled in the system preferences"
			}
		},
		{
			value: "growl",
			label: {
				name: "Growl notifications",
				description: "Third-party notification service for Windows, macOS and Linux",
				notes: "Requires Growl to be installed and running on the system"
			}
		},
		{
			value: "rich",
			label: {
				name: "Rich notifications",
				description: "Chromium rich notifications",
				notes: "Rendered by the application itself"
			}
		}
	],

	filter: [
		{ value: true, label: "Show all except disabled ones" },
		{ value: false, label: "Ignore all except enabled ones" }
	],

	click: [
		{ id: ATTR_NOTIFY_CLICK_NOOP, label: "Do nothing" },
		{ id: ATTR_NOTIFY_CLICK_FOLLOWED, label: "Go to favorites" },
		{ id: ATTR_NOTIFY_CLICK_STREAM, label: "Open stream" },
		{ id: ATTR_NOTIFY_CLICK_STREAMANDCHAT, label: "Open stream+chat" }
	],

	click_group: [
		{ id: ATTR_NOTIFY_CLICK_NOOP, label: "Do nothing" },
		{ id: ATTR_NOTIFY_CLICK_FOLLOWED, label: "Go to favorites" },
		{ id: ATTR_NOTIFY_CLICK_STREAM, label: "Open all streams" },
		{ id: ATTR_NOTIFY_CLICK_STREAMANDCHAT, label: "Open all streams+chats" }
	]
});
