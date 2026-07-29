import Component from "@ember/component";
import { get, set, observer } from "@ember/object";
import { addObserver, removeObserver } from "@ember/object/observers";


export default Component.extend({
	content: null,
	selection: null,
	value: null,
	optionValuePath: "id",
	optionLabelPath: "label",

	_ignoreNextValueChange: false,
	_selection: null,
	_selectionValuePath: null,
	_selectionValueObserver: null,

	/**
	 * Find initial selection by the given value attribute
	 */
	init() {
		this._super( ...arguments );
		this._setSelectionByValue();
	},

	/**
	 * Clean up observers and caches on destruction
	 */
	willDestroy() {
		this._super( ...arguments );
		this._removeSelectionValueObserver();
	},


	/**
	 * Watch value attribute and try to find a new selection
	 */
	_valueObserver: observer( "value", function() {
		// don't find a new selection if disabled
		if ( this._ignoreNextValueChange ) {
			this._ignoreNextValueChange = false;
			return;
		}

		this._setSelectionByValue();
	}),

	/**
	 * Reset selection value observer if a new selection has been set
	 */
	_selectionObserver: observer( "selection", function() {
		this._removeSelectionValueObserver();
		this._addSelectionValueObserver();
	}),

	/**
	 * Watch changes being made to the content:
	 * - Try to find a selection if there currently is none
	 * - Unset the selection and value attributes if the selection has been removed from the content
	 */
	_contentObserver: observer( "content.[]", function() {
		const content = get( this, "content" );
		const selection = get( this, "selection" );

		if ( !selection ) {
			// no selection: check for matching value (in case a new item has been added)
			this._setSelectionByValue();

		} else {
			// has the current selection been removed from the content list?
			if ( !content.includes( selection ) ) {
				set( this, "selection", null );
				this._ignoreNextValueChange = true;
				set( this, "value", null );
			}
		}
	}),


	/**
	 * Find selection by value and update selection attribute
	 * Will trigger the selection observer if a new selection has been found
	 */
	_setSelectionByValue() {
		const content = get( this, "content" );
		const value = get( this, "value" );
		const optionValuePath = get( this, "optionValuePath" );
		const selection = content.findBy( optionValuePath, value );

		if ( selection !== undefined ) {
			set( this, "selection", selection );
		}
	},

	/**
	 * Remove old selection value observer
	 */
	_removeSelectionValueObserver() {
		if ( !this._selection ) { return; }

		removeObserver(
			this._selection,
			this._selectionValuePath,
			this._selection,
			this._selectionValueObserver
		);
		this._selection = this._selectionValuePath = this._selectionValueObserver = null;
	},

	/**
	 * Add new selection value observer and execute it to update value attribute
	 */
	_addSelectionValueObserver() {
		const selection = get( this, "selection" );
		if ( !selection ) { return; }

		const optionValuePath = get( this, "optionValuePath" );
		const selectionValueObserver = () => {
			const value = get( selection, optionValuePath );
			set( this, "value", value );
		};

		this._selection = selection;
		this._selectionValuePath = optionValuePath;
		this._selectionValueObserver = selectionValueObserver;

		addObserver(
			selection,
			optionValuePath,
			selection,
			selectionValueObserver
		);

		this._selectionValueObserver();
	}
});
