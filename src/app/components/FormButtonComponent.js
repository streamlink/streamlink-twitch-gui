define([
	"ember",
	"text!templates/components/formbutton.html.hbs"
], function( Ember, template ) {

	return Ember.Component.extend({
		layout: Ember.Handlebars.compile( template ),
		tagName: "button",
		attributeBindings: [ "type", "title" ],
		type: "button",
		title: "",
		classNameBindings: [
			":btn",
			"_iconAndNoText:btn-icon",
			"_iconAndText:btn-with-icon",
			"_iconanim:btn-with-anim",
			"class"
		],

		action: "",
		class: "",

		icon: false,
		_iconAndText: Ember.computed.and( "icon", "template" ),
		_iconAndNoText: function() {
			return this.get( "icon" ) && !this.get( "template" );
		}.property( "icon", "template" ),

		iconanim: false,
		_iconanim: false,

		click: function() {
			var self = this,
			    success;
			if ( this.get( "iconanim" ) ) {
				success = function( callback ) {
					self.set( "_iconanim", true );
					self.element.addEventListener( "webkitAnimationEnd", function( e ) {
						if ( e.animationName === "animIconScale" ) {
							self.set( "_iconanim", false );
							if ( callback ) { callback( e ); }
						}
					}, false );
				};
			}

			this.sendAction( "action", success );
		}
	});

});
