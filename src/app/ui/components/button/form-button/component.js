import Component from "@ember/component";
import { get, set, computed } from "@ember/object";
import { equal } from "@ember/object/computed";
import { scheduleOnce } from "@ember/runloop";
import layout from "./template.hbs";
import "./styles.less";


export const STATE_VOID    = 0;
export const STATE_LOADING = 1;
export const STATE_FAILURE = 2;
export const STATE_SUCCESS = 3;


export default Component.extend({
	layout,

	tagName: "button",
	classNames: [
		"form-button-component"
	],
	classNameBindings: [
		"_iconClass",
		"_animClass",
		"class"
	],
	attributeBindings: [
		"type",
		"disabled",
		"title"
	],

	type: "button",
	disabled: false,
	title: null,
	class: "",

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

	/**
	 * Super dirty hack!!!
	 * hasBlock is only available as a keyword in the template
	 * however, we need to know whether the component was invoked with a block or not
	 * use this computed property which (lazily) sets a (different) hasBlock property here
	 * this computed property will be called in the template's hasBlock block
	 */
	_setHasBlock: computed(function() {
		scheduleOnce( "afterRender", () => {
			set( this, "hasBlock", true );
		});
	}),

	_iconClass: computed( "icon", "hasBlock", function() {
		return get( this, "icon" )
			? get( this, "hasBlock" )
				? "icon-and-text"
				: "icon"
			: "";
	}),

	_animClass: computed( "_status", function() {
		return get( this, "_status" ) !== STATE_VOID
			? "animated"
			: "";
	}),


	click() {
		let action = get( this, "action" );
		if ( !( action instanceof Function ) ) { return; }

		let hasIconAnim = get( this, "icon" ) && get( this, "iconanim" );
		let animPromises = [];

		if ( hasIconAnim ) {
			// success and failure callbacks
			animPromises.push(
				data => this._iconAnimation( STATE_SUCCESS, data ),
				data => this._iconAnimation( STATE_FAILURE, data )
			);

			if ( get( this, "spinner" ) ) {
				set( this, "_status", STATE_LOADING );
			}
		}

		// invoke action
		let returnPromise = action.call( this, ...animPromises );

		// is returnPromise a "thenable"?
		if ( hasIconAnim && returnPromise && returnPromise.then instanceof Function ) {
			returnPromise
				.then( ...animPromises )
				.catch( () => {} );
		}
	}
});
