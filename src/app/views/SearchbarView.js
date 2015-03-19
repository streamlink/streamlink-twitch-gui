define([
	"ember",
	"text!templates/searchbar.html.hbs"
], function( Ember, template ) {

	return Ember.View.extend({
		defaultTemplate: Ember.HTMLBars.compile( template ),
		tagName: "nav",
		classNames: [ "searchbar" ],

		didInsertElement: function() {
			// dropdown
			var	controller	= this.get( "controller" ),
				search		= this.$().find( "input[type='search']" ).focus(function() {
					window.setTimeout( this.select.bind( this ), 0 );
				})[0],
				dropdown	= this.$().find( ".searchbar-dropdown" )[0],
				dropdownbtn	= this.$().find( ".btn-dropdown" )[0];

			Ember.$( document.body ).click(function( event ) {
				var $target = Ember.$( event.target );
				// ignore clicks on the input, the dropdown button and on the dropdown itself
				if (
						!$target.closest( search ).length
					&&	!$target.closest( dropdownbtn ).length
					&&	!$target.closest( dropdown ).length
				) {
					controller.set( "showDropdown", false );
				}
			});
		}
	});

});
