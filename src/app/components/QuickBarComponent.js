define([
	"Ember",
	"hbs!templates/components/quickbar.html"
], function(
	Ember,
	layout
) {

	var set = Ember.set;
	var run = Ember.run;

	return Ember.Component.extend({
		layout: layout,
		tagName: "div",
		classNameBindings: [ ":quickbar", "isOpened:opened" ],

		isOpened: false,

		timer: null,

		mouseEnter: function() {
			run.cancel( this.timer );
			this.timer = null;

			set( this, "isOpened", true );
		},

		mouseLeave: function() {
			this.timer = run.later( set, this, "isOpened", false, 3000 );
		},


		willDestroyElement: function() {
			if ( this.timer ) {
				run.cancel( this.timer );
			}

			this._super.apply( this, arguments );
		}
	});

});
