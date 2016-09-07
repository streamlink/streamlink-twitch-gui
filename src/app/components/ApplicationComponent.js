import {
	get,
	getOwner,
	computed,
	inject,
	Component
} from "Ember";
import { themes } from "config";
import { isDarwin } from "utils/node/platform";
import guiSelectable from "gui/selectable";
import {
	enable as enableSmoothScroll,
	disable as disableSmoothScroll
} from "gui/smoothscroll";


const { alias } = computed;
const { service } = inject;
const { themes: themesList } = themes;

const reTheme = /^theme-/;

function setupRefresh( controller ) {
	// OSX has its own refresh logic in the menubar module
	if ( isDarwin ) { return; }

	document.documentElement.addEventListener( "keyup", function( e ) {
		var f5    = e.keyCode === 116;
		var ctrlR = e.keyCode ===  82 && e.ctrlKey === true;
		if ( f5 || ctrlR ) {
			controller.send( "refresh" );
		}
	}, false );
}


export default Component.extend({
	settings: service(),

	tagName: "body",
	classNames: [ "wrapper", "vertical" ],

	theme: alias( "settings.content.gui_theme" ),

	themeObserver: function() {
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
	}.observes( "themes", "theme" ).on( "init" ),

	smoothscrollObserver: function() {
		if ( get( this, "settings.content.gui_smoothscroll" ) ) {
			enableSmoothScroll();
		} else {
			disableSmoothScroll();
		}
	}.observes( "settings.content.gui_smoothscroll" ).on( "didInsertElement" ),


	willInsertElement() {
		document.documentElement.removeChild( document.body );
	},

	didInsertElement() {
		var controller = getOwner( this ).lookup( "controller:application" );

		guiSelectable();
		setupRefresh( controller );
	}
});
