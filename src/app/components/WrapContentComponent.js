define( [ "Ember" ], function( Ember ) {

	return Ember.Component.extend({
		layout: Ember.HTMLBars.compile( "{{#if hasBlock}}{{yield}}{{/if}}" ),

		didInitAttrs: function() {
			var tagName = this.attrs.tag;
			this.tagName = typeof tagName === "string"
				? tagName
				: "";
		}
	});

});
