define([
	"ember",
	"mixins/PreviewImageViewMixin"
], function( Ember, PreviewImageViewMixin ) {

	return Ember.Component.extend( PreviewImageViewMixin, {
		tagName: "li",
		classNameBindings: [ "isNewItem:newItem" ],

		isNewItem: false
	});

});
