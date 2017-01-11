import {
	get,
	set,
	$,
	computed,
	Component
} from "Ember";
import layout from "templates/components/button/FormButtonComponent.hbs";


const { equal } = computed;

const STATE_VOID    = 0;
const STATE_LOADING = 1;
const STATE_FAILURE = 2;
const STATE_SUCCESS = 3;


export default Component.extend({
	layout,

	// a tagless component is needed because of the `hasBlock` template layer keyword
	tagName: "",

	// workaround for tagless components and isVisible
	$() {
		// just select the first child node (the button element)
		let element = this._renderNode.childNodes[0].firstNode;
		return $( element );
	},

	title  : null,
	"class": null,

	action: null,

	icon    : false,
	iconanim: false,
	spinner : false,

	_status: STATE_VOID,

	isSuccess: equal( "_status", STATE_SUCCESS ),
	isFailure: equal( "_status", STATE_FAILURE ),
	isLoading: equal( "_status", STATE_LOADING ),

	_iconAnimation( status, data ) {
		return new Promise( ( resolve, reject ) => {
			set( this, "_status", status );
			this.$().one( "webkitAnimationEnd", () => {
				set( this, "_status", STATE_VOID );
				if ( status === STATE_SUCCESS ) {
					resolve( data );
				} else {
					reject( data );
				}
			});
		});
	},

	actions: {
		click() {
			let action  = get( this, "action" );
			if ( !action ) { return; }

			let animPromises = [];

			if ( get( this, "icon" ) && get( this, "iconanim" ) ) {
				// success and failure callbacks
				animPromises.push(
					data => this._iconAnimation( STATE_SUCCESS, data ),
					data => this._iconAnimation( STATE_FAILURE, data )
				);

				if ( get( this, "spinner" ) ) {
					set( this, "_status", STATE_LOADING );
				}
			}

			// handle actions as functions
			if ( action instanceof Function ) {
				action( ...animPromises );

			// allow the component to send actions to itself
			// in case it has been extended and uses its own actions
			} else if (
				   this.actions instanceof Object
				&& this.actions.hasOwnProperty( action )
			) {
				this.send( action, ...animPromises );
			}
		}
	}
});
