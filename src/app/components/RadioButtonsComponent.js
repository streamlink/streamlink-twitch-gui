define([
	"ember",
	"text!templates/components/radiobuttons.html.hbs"
], function( Ember, template ) {

	var get = Ember.get,
		set = Ember.set;

	return Ember.Component.extend({
		layout: Ember.Handlebars.compile( template ),
		tagName: "div",
		className: "",
		classNameBindings: [ ":radiobtns", "className" ],

		// generate button id for label attribute "for"
		_content: function() {
			var buttonName = get( this, "buttonName" );
			return get( this, "content" ).map(function( button, i ) {
				set( button, "_id", buttonName + "-" + i );
				return button;
			});
		}.property( "content", "content.[]", "buttonName" )
	});

});
