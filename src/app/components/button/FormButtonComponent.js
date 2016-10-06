import {
	get,
	set,
	makeArray,
	$,
	computed,
	Component
} from "Ember";
import layout from "templates/components/button/FormButtonComponent.hbs";


const { equal } = computed;

const STATE_LOADING = -1;
const STATE_FAILURE =  0;
const STATE_SUCCESS =  1;

function iconAnimation( status, data ) {
	let self = this;

	return new Promise(function( resolve, reject ) {
		set( self, "_status", status );
		self.$().one( "webkitAnimationEnd", function() {
			set( self, "_status", null );
			( status ? resolve : reject )( data );
		});
	});
}


export default Component.extend({
	layout,

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
		click() {
			var action  = get( this, "action" );
			if ( !action ) { return; }

			var actionContext = makeArray( get( this, "actionParam" ) );

			if ( get( this, "icon" ) && get( this, "iconanim" ) ) {
				// success and failure callbacks
				actionContext.push( iconAnimation.bind( this, STATE_SUCCESS ) );
				actionContext.push( iconAnimation.bind( this, STATE_FAILURE ) );

				if ( get( this, "spinner" ) ) {
					set( this, "_status", STATE_LOADING );
				}
			}

			// handle actions as functions
			if ( action instanceof Function ) {
				// FIXME: targetObject
				action.apply(
					get( this, "_targetObject" ),
					actionContext
				);

			// allow the component to send actions to itself
			// in case it has been extended and uses its own actions
			} else if (
				   this.actions instanceof Object
				&& this.actions.hasOwnProperty( action )
			) {
				this.send( action, ...actionContext );

			} else {
				// FIXME: targetObject
				this.triggerAction({
					target: get( this, "_targetObject" ),
					action,
					actionContext
				});
			}
		}
	}
});
