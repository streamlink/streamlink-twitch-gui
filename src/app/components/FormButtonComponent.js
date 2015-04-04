define([
	"ember",
	"text!templates/components/formbutton.html.hbs"
], function( Ember, template ) {

	var get = Ember.get,
	    set = Ember.set;

	return Ember.Component.extend({
		layout: Ember.HTMLBars.compile( template ),
		tagName: "button",
		attributeBindings: [ "type", "title", "disabled" ],
		type: "button",
		title: null,
		classNameBindings: [
			":btn",
			"_iconAndNoText:btn-icon",
			"_iconAndText:btn-with-icon",
			"_iconanim:btn-with-anim",
			"class"
		],
		class: null,

		action: null,
		actionParam: null,

		icon: false,
		_iconAndText: Ember.computed.and( "icon", "template" ),
		_iconAndNoText: function() {
			return get( this, "icon" ) && !get( this, "template" );
		}.property( "icon", "template" ),

		iconanim: false,
		_iconanim: false,

		click: function() {
			var self    = this,
			    target  = get( this, "targetObject" ),
			    action  = get( this, "action" ),
			    context = Ember.makeArray( get( this, "actionParam" ) );

			if ( !action ) { return; }

			if ( get( this, "iconanim" ) ) {
				context = context.concat(function animationStart( callback ) {
					set( self, "_iconanim", true );
					self.$().one( "webkitAnimationEnd", function animationEnd( e ) {
						e = e.originalEvent;
						if ( e.animationName !== "animIconScale" ) { return; }

						set( self, "_iconanim", false );
						if ( callback instanceof Function ) {
							callback( e );
						}
					});
				});
			}

			this.triggerAction({
				target: target,
				action: action,
				actionContext: context
			});
		}
	});

});
