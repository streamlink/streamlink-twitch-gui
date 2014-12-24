define( [ "ember" ], function( Ember ) {

	return Ember.DefaultResolver.extend({

		/**
		 * resolve templates like everything else
		 * also compile templates afterwards
		 */
		resolveTemplate: function( name ) {
			this.useRouterNaming( name );
			var template = this.resolveOther( name );
			return typeof template === "string"
				? Ember.Handlebars.compile( template )
				: template;
		}

	});

});
