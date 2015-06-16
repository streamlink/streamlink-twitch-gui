define([
	"Ember",
	"text!templates/user/index.html.hbs"
], function( Ember, template ) {

	return Ember.View.extend({
		template: Ember.HTMLBars.compile( template ),
		tagName: "main",
		classNames: [ "content", "content-user", "content-user-index" ],

		showTokenForm: false,

		actions: {
			"showTokenForm": function() {
				this.set( "showTokenForm", true );
				Ember.run.next( this, function() {
					this.$( "input" ).focus();
				});
			}
		}
	});

});
