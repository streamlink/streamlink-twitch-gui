import {
	get,
	computed,
	inject,
	observer,
	Component
} from "Ember";
import { themes } from "config";
import { isDarwin } from "utils/node/platform";
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
	routing: service( "-routing" ),
	settings: service(),

	layout,

	tagName: "body",
	classNames: [ "wrapper", "vertical" ],

	theme: alias( "settings.content.gui_theme" ),

	themeObserver: observer( "themes", "theme", function() {
		var theme  = get( this, "theme" );

		if ( themesList.indexOf( theme ) === -1 ) {
			theme = "default";
		}

		var list = document.documentElement.classList;
		[].forEach.call( list, function( name ) {
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
		// f5 or ctrl+r
		if ( e.keyCode === 116 || e.keyCode ===  82 && e.ctrlKey === true ) {
			// MacOS has its menubar with its own hotkeys
			if ( isDarwin ) { return; }
			get( this, "routing" ).refresh();

		// alt+left
		} else if ( e.keyCode === 37 && e.altKey ) {
			get( this, "routing" ).history( -1 );

		// alt+right
		} else if ( e.keyCode === 39 && e.altKey ) {
			get( this, "routing" ).history( +1 );

		} else {
			return;
		}

		e.preventDefault();
		e.stopImmediatePropagation();
	},

	disableGlobalDragAndDrop() {
		this.$().on( "dragstart dragover dragend dragenter dragleave dragexit drag drop", e => {
			e.preventDefault();
			e.stopImmediatePropagation();
		});
	}
});
