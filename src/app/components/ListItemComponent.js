define([
	"Ember",
	"mixins/PreviewImageViewMixin"
], function( Ember, PreviewImageViewMixin ) {

	return Ember.Component.extend( PreviewImageViewMixin, {
		settings: Ember.inject.service(),

		tagName: "li",
		classNameBindings: [ "isNewItem:newItem" ],

		isNewItem: false
	});

});
