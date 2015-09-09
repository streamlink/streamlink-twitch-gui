define([
	"Ember",
	"text!templates/components/formbutton.html.hbs"
], function(
	Ember,
	layout
) {

	var get = Ember.get;
	var set = Ember.set;
	var makeArray = Ember.makeArray;
	var $ = Ember.$;

	function iconAnimation( success, data ) {
		var defer = Promise.defer();
		// dirty
		var element  = this._renderNode.firstNode;

		set( this, "_iconAnimState", success );
		$( element ).one( "webkitAnimationEnd", function() {
			set( this, "_iconAnimState", null );
			defer[ success ? "resolve" : "reject" ]( data );
		}.bind( this ) );

		return defer.promise;
	}

	return Ember.Component.extend({
		layout: Ember.HTMLBars.compile( layout ),

		tagName: "",

		title  : null,
		"class": null,

		action     : null,
		actionParam: null,

		icon    : false,
		iconanim: false,

		_iconAnimState: null,

		actions: {
			click: function() {
				var action  = get( this, "action" );
				if ( !action ) { return; }

				var context = makeArray( get( this, "actionParam" ) );

				if ( get( this, "icon" ) && get( this, "iconanim" ) ) {
					// success animation
					context.push( iconAnimation.bind( this, true ) );
					// failure animation
					context.push( iconAnimation.bind( this, false ) );
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
