define([
	"Ember",
	"templates/components/button/FormButtonComponent.hbs"
], function(
	Ember,
	layout
) {

	var get = Ember.get;
	var set = Ember.set;
	var makeArray = Ember.makeArray;
	var equal = Ember.computed.equal;
	var $ = Ember.$;

	var STATE_LOADING = -1;
	var STATE_FAILURE =  0;
	var STATE_SUCCESS =  1;

	function iconAnimation( status, data ) {
		var defer = Promise.defer();

		set( this, "_status", status );
		this.$().one( "webkitAnimationEnd", function() {
			set( this, "_status", null );
			defer[ status ? "resolve" : "reject" ]( data );
		}.bind( this ) );

		return defer.promise;
	}


	return Ember.Component.extend({
		layout: layout,

		tagName: "",

		// prevents an ember bug regarding tagless components and isVisible bindings
		$: function() {
			// use the layout's first element as component element
			var element = this._renderNode.childNodes[0].firstNode;
			return $( element );
		},

		title  : null,
		"class": null,

		action     : null,
		actionParam: null,

		icon    : false,
		iconanim: false,
		spinner : false,

		_status: null,

		isSuccess: equal( "_status", STATE_SUCCESS ),
		isFailure: equal( "_status", STATE_FAILURE ),
		isLoading: equal( "_status", STATE_LOADING ),

		actions: {
			click: function() {
				var action  = get( this, "action" );
				if ( !action ) { return; }

				var context = makeArray( get( this, "actionParam" ) );

				if ( get( this, "icon" ) && get( this, "iconanim" ) ) {
					// success and failure callbacks
					context.push( iconAnimation.bind( this, STATE_SUCCESS ) );
					context.push( iconAnimation.bind( this, STATE_FAILURE ) );

					if ( get( this, "spinner" ) ) {
						set( this, "_status", STATE_LOADING );
					}
				}

				// handle actions as functions
				if ( action instanceof Function ) {
					action.apply(
						get( this, "targetObject" ),
						context
					);

				// allow the component to send actions to itself
				// in case it has been extended and uses its own actions
				} else if (
					   this.actions instanceof Object
					&& this.actions.hasOwnProperty( action )
				) {
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
