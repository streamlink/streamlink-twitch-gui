define([
	"Ember",
	"text!templates/settings.html.hbs"
], function( Ember, template ) {

	var get = Ember.get;

	return Ember.View.extend({
		template: Ember.HTMLBars.compile( template ),
		tagName: "main",
		classNames: [ "content", "content-settings" ],

		RadioBoxesView: Ember.View.extend({
			tagName: "div"
		}),

		playerCmdSubstitutionsVisible: false,
		playerCmdSubstitutions: function() {
			var store = get( this, "controller.store" );
			var model = store.modelFor( "livestreamer" );
			/** @type {Substitution[]} */
			var substitutions = get( model, "substitutions" );

			return substitutions.map(function( substitution ) {
				/** @type {string[]} */
				var vars = substitution.vars;
				vars = vars.map(function( vars ) {
					return "{%@}".fmt( vars );
				});

				return {
					variable   : vars[0],
					tooltip    : vars.join( ", " ),
					description: substitution.description
				};
			});
		}.property(),
		playerCmdSubstitutionsIcon: function() {
			return get( this, "playerCmdSubstitutionsVisible" )
				? "fa-chevron-up"
				: "fa-chevron-down";
		}.property( "playerCmdSubstitutionsVisible" ),

		actions: {
			"togglePlayerCmdSubstitutions": function() {
				this.toggleProperty( "playerCmdSubstitutionsVisible" );
			}
		}
	});

});
