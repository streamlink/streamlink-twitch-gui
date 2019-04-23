import { computed } from "@ember/object";
import attr from "ember-data/attr";
import Fragment from "ember-data-model-fragments/fragment";


export const ATTR_GUI_INTEGRATION_TASKBAR = 1;
export const ATTR_GUI_INTEGRATION_TRAY = 2;
export const ATTR_GUI_INTEGRATION_BOTH = ATTR_GUI_INTEGRATION_TASKBAR | ATTR_GUI_INTEGRATION_TRAY;

export const ATTR_GUI_MINIMIZE_NOOP = 0;
export const ATTR_GUI_MINIMIZE_MINIMIZE = 1;
export const ATTR_GUI_MINIMIZE_TRAY = 2;

export const ATTR_GUI_FOCUSREFRESH_NONE = 0;
export const ATTR_GUI_FOCUSREFRESH_ONE = 60000;
export const ATTR_GUI_FOCUSREFRESH_TWO = 120000;
export const ATTR_GUI_FOCUSREFRESH_FIVE = 300000;


export default class SettingsGui extends Fragment {
	static integration = [
		{ id: ATTR_GUI_INTEGRATION_BOTH, label: "both" },
		{ id: ATTR_GUI_INTEGRATION_TASKBAR, label: "taskbar" },
		{ id: ATTR_GUI_INTEGRATION_TRAY, label: "tray" }
	];

	static minimize = [
		{ id: ATTR_GUI_MINIMIZE_NOOP, label: "noop", disabled: false },
		{ id: ATTR_GUI_MINIMIZE_MINIMIZE, label: "minimize", disabled: false },
		{ id: ATTR_GUI_MINIMIZE_TRAY, label: "tray", disabled: false }
	];

	static focusrefresh = [
		{ id: ATTR_GUI_FOCUSREFRESH_NONE, label: "none" },
		{ id: ATTR_GUI_FOCUSREFRESH_ONE, label: "one" },
		{ id: ATTR_GUI_FOCUSREFRESH_TWO, label: "two" },
		{ id: ATTR_GUI_FOCUSREFRESH_FIVE, label: "five" }
	];

	@attr( "boolean", { defaultValue: false } )
	externalcommands;
	@attr( "number", { defaultValue: ATTR_GUI_FOCUSREFRESH_NONE } )
	focusrefresh;
	@attr( "boolean", { defaultValue: false } )
	hidebuttons;
	@attr( "string", { defaultValue: "/featured" } )
	homepage;
	@attr( "number", { defaultValue: ATTR_GUI_INTEGRATION_BOTH } )
	integration;
	@attr( "string",  { defaultValue: "auto" } )
	language;
	@attr( "number", { defaultValue: ATTR_GUI_MINIMIZE_NOOP } )
	minimize;
	@attr( "boolean", { defaultValue: false } )
	minimizetotray;
	@attr( "boolean", { defaultValue: true } )
	smoothscroll;
	@attr( "string", { defaultValue: "system" } )
	theme;


	@computed( "integration" )
	get isVisibleInTaskbar() {
		return ( this.integration & ATTR_GUI_INTEGRATION_TASKBAR ) > 0;
	}

	@computed( "integration" )
	get isVisibleInTray() {
		return ( this.integration & ATTR_GUI_INTEGRATION_TRAY ) > 0;
	}
}
