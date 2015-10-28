define([
	"Ember",
	"hbs!templates/components/QuickBarComponent.html"
], function(
	Ember,
	layout
) {

	var get = Ember.get;
	var set = Ember.set;
	var run = Ember.run;

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
			if ( this.timer ) {
				run.cancel( this.timer );
				this.timer = null;
			}

			set( this, "isOpened", true );
		},

		mouseLeave: function() {
			if ( !get( this, "isLocked" ) ) {
				this.timer = run.later( set, this, "isOpened", false, 1000 );
			}
		},


		willDestroyElement: function() {
			if ( this.timer ) {
				run.cancel( this.timer );
			}

			this._super.apply( this, arguments );
		},


		actions: {
			"menuClick": function() {
				this.toggleProperty( "isLocked" );
			}
		}
	});

});
