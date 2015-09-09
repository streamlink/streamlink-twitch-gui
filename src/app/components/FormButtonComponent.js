define([
	"Ember",
	"text!templates/components/formbutton.html.hbs"
], function( Ember, template ) {

	var get = Ember.get;
	var set = Ember.set;
	var $ = Ember.$;

	return Ember.Component.extend({
		layout: Ember.HTMLBars.compile( template ),

		tagName: "",

		title  : null,
		"class": null,

		action     : null,
		actionParam: null,

		icon    : false,
		iconanim: false,

		_iconanim: false,

		_iconAnimation: function( data ) {
			var self  = this;
			var defer = Promise.defer();
			// dirty
			var element = this._renderNode.firstNode;

			set( self, "_iconanim", true );
			$( element ).one( "webkitAnimationEnd", function( e ) {
				if ( e.originalEvent.animationName !== "animIconScale" ) { return; }

				set( self, "_iconanim", false );
				defer.resolve( data );
			});

			return defer.promise;
		},

		actions: {
			click: function() {
				var action  = get( this, "action" );
				if ( !action ) { return; }

				var context = Ember.makeArray( get( this, "actionParam" ) );

				if ( this.attrs.iconanim ) {
					context.push( this._iconAnimation.bind( this ) );
				}

				// allow the component to send actions to itself
				// in case it has been extended and uses its own actions
				if ( this._actions instanceof Object && this._actions.hasOwnProperty( action ) ) {
					this.send.apply( this, [ action ].concat( context ) );

				} else {
					this.triggerAction({
						target: get( this, "targetObject" ),
						action: action,
						actionContext: context
					});
				}
			}
		}
	});

});
