define([
	"Ember",
	"text!templates/components/langfilter.html.hbs"
], function( Ember, layout ) {

	var get = Ember.get;
	var set = Ember.set;

	return Ember.Component.extend({
		layout: Ember.HTMLBars.compile( layout ),
		tagName: "li",

		checked: Ember.computed( "obj", "language", function( key, value ) {
			var obj = get( this, "obj" );
			var id  = get( this, "language.id" );

			if ( arguments.length > 1 ) {
				set( obj, id, value );
				return value;

			} else {
				return obj.hasOwnProperty( id )
					? obj[ id ]
					// no value set yet, just enable it by default
					: true;
			}
		})
	});

});
