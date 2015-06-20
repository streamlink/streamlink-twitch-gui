define([
	"Ember",
	"mixins/PreviewImageViewMixin"
], function( Ember, PreviewImageViewMixin ) {

	var set = Ember.set;

	return Ember.Component.extend( PreviewImageViewMixin, {
		tagName: "li",
		classNameBindings: [ "isNewItem:newItem" ],

		isNewItem: false,

		init: function() {
			this._super.apply( this, arguments );

			var settings = this.container.lookup( "record:settings" );
			set( this, "settings", settings );
		}
	});

});
