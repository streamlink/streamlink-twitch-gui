define( [ "Ember" ], function( Ember ) {

	return Ember.Component.extend({
		settings: Ember.inject.service(),

		tagName: "li",
		classNameBindings: [
			"isNewItem:newItem",
			"isDuplicateItem:duplicateItem"
		],

		isNewItem: false,
		isDuplicateItem: false,

		openBrowser: "openBrowser",

		actions: {
			"openBrowser": function( url ) {
				this.sendAction( "openBrowser", url );
			}
		}
	});

});
