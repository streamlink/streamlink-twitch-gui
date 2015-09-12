define([
	"Ember",
	"hbs!templates/components/radiobuttons.html"
], function(
	Ember,
	layout
) {

	var get = Ember.get;
	var set = Ember.set;

	return Ember.Component.extend({
		layout: layout,
		tagName: "div",
		className: "",
		classNameBindings: [ "boxes:radiobtns", "className" ],
		boxes: true,
		icon: false,
		wrap: false,

		// generate button id for label attribute "for"
		_content: function() {
			var buttonName = get( this, "buttonName" );
			return get( this, "content" ).map(function( button, i ) {
				var id = get( button, "id" );
				if ( id === undefined ) { id = i; }

				// give buttons unique IDs
				set( button, "_id", buttonName + "-" + id );

				// use the ID as value if there was no value specified
				if ( !button.hasOwnProperty( "value" ) ) {
					set( button, "value", id );
				}

				return button;
			});
		}.property( "content", "content.[]", "buttonName" )
	});

});
