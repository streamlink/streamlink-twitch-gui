import {
	get,
	computed,
	inject,
	observer,
	Component
} from "ember";
import { themes } from "config";
import guiSelectable from "gui/selectable";
import {
	enable as enableSmoothScroll,
	disable as disableSmoothScroll
} from "gui/smoothscroll";
import layout from "templates/components/ApplicationComponent.hbs";


const { alias } = computed;
const { service } = inject;
const { themes: themesList } = themes;

const reTheme = /^theme-/;


export default Component.extend({
	hotkey: service(),
	settings: service(),

	layout,

	tagName: "body",
	classNames: [ "wrapper", "vertical" ],

	theme: alias( "settings.content.gui_theme" ),

	themeObserver: observer( "themes", "theme", function() {
		let theme = get( this, "theme" );

		if ( themesList.indexOf( theme ) === -1 ) {
			theme = "default";
		}

		const list = document.documentElement.classList;
		list.forEach( name => {
			if ( !reTheme.test( name ) ) { return; }
			list.remove( name );
		});

		list.add( `theme-${theme}` );
	}).on( "init" ),

	smoothscrollObserver: observer( "settings.content.gui_smoothscroll", function() {
		if ( get( this, "settings.content.gui_smoothscroll" ) ) {
			enableSmoothScroll();
		} else {
			disableSmoothScroll();
		}
	}).on( "didInsertElement" ),


	init() {
		document.documentElement.removeChild( document.body );
		this._super( ...arguments );
	},

	didInsertElement() {
		guiSelectable();
		this.disableGlobalDragAndDrop();
		this._super( ...arguments );
	},

	keyUp( e ) {
		const HotkeyService = get( this, "hotkey" );

		return HotkeyService.trigger( e );
	},

	disableGlobalDragAndDrop() {
		this.$().on( "dragstart dragover dragend dragenter dragleave dragexit drag drop", e => {
			e.preventDefault();
			e.stopImmediatePropagation();
		});
	}
});
