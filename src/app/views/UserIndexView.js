define([
	"Ember",
	"text!templates/user/index.html.hbs"
], function( Ember, template ) {

	var set = Ember.set;

	return Ember.View.extend({
		template: Ember.HTMLBars.compile( template ),
		tagName: "main",
		classNames: [ "content", "content-user", "content-user-index" ],

		showTokenForm: false,

		actions: {
			"showTokenForm": function() {
				set( this, "showTokenForm", true );
				Ember.run.next( this, function() {
					this.$( "input" ).focus();
				});
			}
		}
	});

});
