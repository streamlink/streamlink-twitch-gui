define([
	"ember",
	"text!templates/application.html.hbs",
	"gui/selectable",
	"gui/smoothscroll",
	"gui/selecter"
], function( Ember, Template, GUISelectable, GUISmoothscroll, GUISelecter ) {

	Ember.LinkView.reopen({
		didInsertElement: function() {
			this._super.apply( this, arguments );
			this.$().on( "click", function( e ) {
				if ( e.button !== 0 ) {
					e.preventDefault();
					e.stopImmediatePropagation();
				}
			});
		},

		_invoke: function() {
			if ( this.get( "active" ) ) {
				this.get( "controller" ).send( "refresh" );
			} else {
				this._super.apply( this, arguments );
			}
		}
	});

	Ember.Select.reopen({
		didInsertElement: function() {
			this._super();
			GUISelecter( this.$() );
		}
	});

	return Ember.View.extend({
		template: Ember.Handlebars.compile( Template ),
		tagName: "body",
		classNames: [ "wrapper", "vertical" ],

		willInsertElement: function() {
			document.documentElement.removeChild( document.body );
		},
		didInsertElement: function() {
			GUISelectable();
			GUISmoothscroll();
		}
	});

});
