import attr from "ember-data/attr";
import Fragment from "ember-data-model-fragments/fragment";


export const ATTR_NOTIFY_CLICK_NOOP = 0;
export const ATTR_NOTIFY_CLICK_FOLLOWED = 1;
export const ATTR_NOTIFY_CLICK_STREAM = 2;
export const ATTR_NOTIFY_CLICK_STREAMANDCHAT = 3;


export default class SettingsNotification extends Fragment {
	static providers = [
		{ id: "auto" },
		{ id: "native" },
		{ id: "snoretoast" },
		{ id: "growl" },
		{ id: "rich" }
	];

	static filter = [
		{ id: true, label: "blacklist" },
		{ id: false, label: "whitelist" }
	];

	static click = [
		{ id: ATTR_NOTIFY_CLICK_NOOP, label: "noop" },
		{ id: ATTR_NOTIFY_CLICK_FOLLOWED, label: "followed" },
		{ id: ATTR_NOTIFY_CLICK_STREAM, label: "stream" },
		{ id: ATTR_NOTIFY_CLICK_STREAMANDCHAT, label: "stream-and-chat" }
	];

	static clickGroup = [
		{ id: ATTR_NOTIFY_CLICK_NOOP, label: "noop" },
		{ id: ATTR_NOTIFY_CLICK_FOLLOWED, label: "followed" },
		{ id: ATTR_NOTIFY_CLICK_STREAM, label: "stream" },
		{ id: ATTR_NOTIFY_CLICK_STREAMANDCHAT, label: "stream-and-chat" }
	];

	@attr( "boolean", { defaultValue: true } )
	enabled;
	@attr( "string", { defaultValue: "auto" } )
	provider;
	@attr( "boolean", { defaultValue: true } )
	filter;
	@attr( "boolean", { defaultValue: true } )
	filter_vodcasts;
	@attr( "boolean", { defaultValue: true } )
	grouping;
	@attr( "number", { defaultValue: 1 } )
	click;
	@attr( "number", { defaultValue: 1 } )
	click_group;
	@attr( "boolean", { defaultValue: true } )
	click_restore;
	@attr( "boolean", { defaultValue: true } )
	badgelabel;
}
