import {
	get,
	computed
} from "ember";
import { attr } from "ember-data";
import { Fragment } from "model-fragments";
import {
	themes as themesConfig
} from "config";


const defaultTheme = themesConfig.themes[0];


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


export default Fragment.extend({
	externalcommands: attr( "boolean", { defaultValue: false } ),
	focusrefresh: attr( "number", { defaultValue: ATTR_GUI_FOCUSREFRESH_NONE } ),
	hidebuttons: attr( "boolean", { defaultValue: false } ),
	homepage: attr( "string", { defaultValue: "/featured" } ),
	integration: attr( "number", { defaultValue: ATTR_GUI_INTEGRATION_BOTH } ),
	minimize: attr( "number", { defaultValue: ATTR_GUI_MINIMIZE_NOOP } ),
	minimizetotray: attr( "boolean", { defaultValue: false } ),
	smoothscroll: attr( "boolean", { defaultValue: true } ),
	theme: attr( "string", { defaultValue: defaultTheme } ),


	isVisibleInTaskbar: computed( "integration", function() {
		return ( get( this, "integration" ) & ATTR_GUI_INTEGRATION_TASKBAR ) > 0;
	}),

	isVisibleInTray: computed( "integration", function() {
		return ( get( this, "integration" ) & ATTR_GUI_INTEGRATION_TRAY ) > 0;
	})

}).reopenClass({

	integration: [
		{ id: ATTR_GUI_INTEGRATION_BOTH, label: "Both" },
		{ id: ATTR_GUI_INTEGRATION_TASKBAR, label: "Taskbar" },
		{ id: ATTR_GUI_INTEGRATION_TRAY, label: "Tray" }
	],

	minimize: [
		{ id: ATTR_GUI_MINIMIZE_NOOP, label: "Do nothing", disabled: false },
		{ id: ATTR_GUI_MINIMIZE_MINIMIZE, label: "Minimize", disabled: false },
		{ id: ATTR_GUI_MINIMIZE_TRAY, label: "Move to tray", disabled: false }
	],

	focusrefresh: [
		{ id: ATTR_GUI_FOCUSREFRESH_NONE, label: "Don't refresh" },
		{ id: ATTR_GUI_FOCUSREFRESH_ONE, label: "After one minute" },
		{ id: ATTR_GUI_FOCUSREFRESH_TWO, label: "After two minutes" },
		{ id: ATTR_GUI_FOCUSREFRESH_FIVE, label: "After five minutes" }
	]
});
