define([
	"ember",
	"text!templates/components/radiobuttons.html.hbs"
], function( Ember, template ) {

	var get = Ember.get,
	    set = Ember.set;

	return Ember.Component.extend({
		layout: Ember.HTMLBars.compile( template ),
		tagName: "div",
		className: "",
		classNameBindings: [ "boxes:radiobtns", "className" ],
		boxes: true,
		icon: false,

		buttonView: Ember._MetamorphView,
		buttonClass: function() {
			return get( this, "boxes" )
				? "default"
				: "";
		}.property( "boxes" ),

		// generate button id for label attribute "for"
		_content: function() {
			var buttonName = get( this, "buttonName" );
			return get( this, "content" ).map(function( button, i ) {
				var id = get( button, "id" );
				if ( id === undefined ) { id = i; }

				// give each button a unique id
				set( button, "_id", buttonName + "-" + id );

				// use the id as value if there was no value specified
				if ( !button.hasOwnProperty( "value" ) ) {
					set( button, "value", id );
				}

				return button;
			});
		}.property( "content", "content.[]", "buttonName" )
	});

});
