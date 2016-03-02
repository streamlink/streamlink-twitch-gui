define([
	"Ember",
	"hbs!templates/components/list/ContentListComponent"
], function(
	Ember,
	layout
) {

	var get = Ember.get;
	var set = Ember.set;
	var setProperties = Ember.setProperties;


	return Ember.Component.extend({
		layout: layout,

		tagName: "",
		"class": "",

		content   : null,
		duplicates: null,

		length : 0,
		initial: 0,


		init: function() {
			this._super.apply( this, arguments );

			var length = get( this, "content.length" );
			setProperties( this, {
				initial   : length,
				length    : length,
				duplicates: {}
			});
		},


		_contentLengthObserver: function() {
			var duplicates = get( this, "duplicates" );
			var content    = get( this, "content" );
			var index      = get( this, "length" );
			var length     = get( content, "length" );
			var diff       = -length + index - 1;

			for ( ; index < length; index++ ) {
				if ( content.lastIndexOf( content[ index ], diff ) !== -1 ) {
					duplicates[ index ] = true;
				}
			}

			set( this, "length", length );
		}.observes( "content.length" )
	});

});
