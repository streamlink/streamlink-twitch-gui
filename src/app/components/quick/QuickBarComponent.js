import {
	get,
	set,
	computed,
	run,
	Component
} from "Ember";
import layout from "templates/components/QuickBarComponent.hbs";


const { cancel, later } = run;


export default Component.extend({
	layout,

	tagName: "div",
	classNameBindings: [
		":quick-bar-component",
		"isOpened:opened",
		"isLocked:locked"
	],

	isOpened: computed({
		get: function() {
			return get( this, "isLocked" );
		}
	}),
	isLocked: computed({
		get: function() {
			return this.constructor.isLocked;
		},
		set: function( key, value ) {
			if ( value ) {
				set( this, "isOpened", true );
			}
			this.constructor.isLocked = value;
			return value;
		}
	}),

	timer: null,

	mouseEnter: function() {
		set( this, "isOpened", true );
	},

	mouseLeave: function() {
		if ( get( this, "isLocked" ) ) { return; }
		this.timer = later( set, this, "isOpened", false, 1000 );
	},


	clearTimer: function() {
		if ( this.timer ) {
			cancel( this.timer );
			this.timer = null;
		}
	}.on( "willDestroyElement", "mouseEnter" ),


	actions: {
		"menuClick": function() {
			this.toggleProperty( "isLocked" );
		}
	}

}).reopenClass({
	isLocked: false
});
