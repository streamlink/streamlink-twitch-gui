define([
	"ember",
	"text!templates/user/index.html.hbs"
], function( Ember, Template ) {

	return Ember.View.extend({
		template: Ember.Handlebars.compile( Template ),
		tagName: "main",
		classNames: [ "content", "content-user", "content-user-index" ],

		showTokenForm: false,

		auth_scope: function() {
			return this.get( "controller.auth.scope" ).split( "+" ).join( ", " );
		}.property( "controller.auth.scope" ),

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
