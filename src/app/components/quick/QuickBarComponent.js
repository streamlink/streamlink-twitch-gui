define([
	"Ember",
	"hbs!templates/components/QuickBarComponent"
], function(
	Ember,
	layout
) {

	var get = Ember.get;
	var set = Ember.set;
	var later = Ember.run.later;
	var cancel = Ember.run.cancel;

	return Ember.Component.extend({
		layout: layout,
		tagName: "div",
		classNameBindings: [
			":quick-bar-component",
			"isOpened:opened",
			"isLocked:locked"
		],

		isOpened: false,
		isLocked: false,

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
	});

});
