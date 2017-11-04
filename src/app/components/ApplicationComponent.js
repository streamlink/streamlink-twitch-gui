import {
	get,
	inject,
	observer,
	Component
} from "ember";
import {
	themes as themesConfig
} from "config";
import guiSelectable from "gui/selectable";
import {
	enable as enableSmoothScroll,
	disable as disableSmoothScroll
} from "gui/smoothscroll";
import layout from "templates/components/ApplicationComponent.hbs";


const { service } = inject;
const { themes } = themesConfig;

const reTheme = /^theme-/;


export default Component.extend({
	hotkey: service(),
	settings: service(),

	layout,

	tagName: "body",
	classNames: [ "wrapper", "vertical" ],

	themeObserver: observer( "settings.gui.theme", function() {
		let theme = get( this, "settings.gui.theme" );

		if ( !themes.includes( theme ) ) {
			theme = "default";
		}

		const list = document.documentElement.classList;
		list.forEach( name => {
			if ( !reTheme.test( name ) ) { return; }
			list.remove( name );
		});

		list.add( `theme-${theme}` );
	}).on( "init" ),

	smoothscrollObserver: observer( "settings.gui.smoothscroll", function() {
		if ( get( this, "settings.gui.smoothscroll" ) ) {
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

	keyDown( e ) {
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
