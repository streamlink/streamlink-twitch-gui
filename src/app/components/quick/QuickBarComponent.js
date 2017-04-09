import {
	get,
	set,
	computed,
	run,
	on,
	Component
} from "ember";
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
		get() {
			return get( this, "isLocked" );
		}
	}),
	isLocked: computed({
		get() {
			return this.constructor.isLocked;
		},
		set( key, value ) {
			if ( value ) {
				set( this, "isOpened", true );
			}
			this.constructor.isLocked = value;
			return value;
		}
	}),

	timer: null,

	mouseEnter() {
		set( this, "isOpened", true );
	},

	mouseLeave() {
		if ( get( this, "isLocked" ) ) { return; }
		this.timer = later( () => set( this, "isOpened", false, 1000 ) );
	},


	clearTimer: on( "willDestroyElement", "mouseEnter", function() {
		if ( this.timer ) {
			cancel( this.timer );
			this.timer = null;
		}
	}),


	actions: {
		menuClick() {
			this.toggleProperty( "isLocked" );
		}
	}

}).reopenClass({
	isLocked: false
});
