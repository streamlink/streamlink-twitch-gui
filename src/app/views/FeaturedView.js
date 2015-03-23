define([
	"ember",
	"text!templates/featured.html.hbs"
], function( Ember, template ) {

	var $ = Ember.$;

	return Ember.View.extend({
		defaultTemplate: Ember.HTMLBars.compile( template ),
		tagName: "main",
		classNames: [ "content", "content-featured", "wrapper", "vertical" ],

		createCursor: function() {
			var $cursor = $( "<i>" ).addClass( "cursor fa fa-caret-down" );
			this.$( ".channels" )
				.append( $cursor )
				.append( $cursor.clone().addClass( "cursor-hover" ) );
		}.on( "willInsertElement" )
	});

});
