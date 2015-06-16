define( [ "Ember" ], function( Ember ) {

	return Ember.DefaultResolver.extend({

		/**
		 * resolve templates like everything else
		 * also compile templates afterwards
		 */
		resolveTemplate: function( name ) {
			this.useRouterNaming( name );
			var template = this.resolveOther( name );
			return typeof template === "string"
				? Ember.HTMLBars.compile( template )
				: template;
		}

	});

});
