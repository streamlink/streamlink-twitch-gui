import Component from "@ember/component";
import { set } from "@ember/object";
import { addObserver, removeObserver } from "@ember/object/observers";
import { observes, on } from "@ember-decorators/object";


const { hasOwnProperty } = {};


export default class SelectableComponent extends Component {
	/** @type {Object[]} */
	content = null;
	/** @type {Object} */
	selection = null;
	value = null;
	optionValuePath = "id";
	optionLabelPath = "label";

	_ignoreNextValueChange = false;
	_selection = null;
	_selectionValuePath = null;
	/** @type {Function} */
	_selectionValueObserver = null;


	/**
	 * Clean up observers and caches on destruction
	 * Can't use an @on decorator here
	 */
	willDestroy() {
		super.willDestroy( ...arguments );
		this._removeSelectionValueObserver();
	}


	/**
	 * Watch value attribute and try to find a new selection
	 */
	@observes( "value" )
	_valueObserver() {
		// don't find a new selection if disabled
		if ( this._ignoreNextValueChange ) {
			this._ignoreNextValueChange = false;
			return;
		}

		this._setSelectionByValue();
	}

	/**
	 * Reset selection value observer if a new selection has been set
	 */
	@observes( "selection" )
	_selectionObserver() {
		this._removeSelectionValueObserver();
		this._addSelectionValueObserver();
	}

	/**
	 * Watch changes being made to the content:
	 * - Try to find a selection if there currently is none
	 * - Unset the selection and value attributes if the selection has been removed from the content
	 */
	@observes( "content.[]" )
	_contentObserver() {
		const selection = this.selection;

		if ( !selection ) {
			// no selection: check for matching value (in case a new item has been added)
			this._setSelectionByValue();

		} else {
			// has the current selection been removed from the content list?
			if ( !this.content.includes( selection ) ) {
				set( this, "selection", null );
				this._ignoreNextValueChange = true;
				set( this, "value", null );
			}
		}
	}


	/**
	 * Find selection by value and update selection attribute
	 * Will trigger the selection observer if a new selection has been found
	 */
	@on( "init" )
	_setSelectionByValue() {
		const value = this.value;
		const optionValuePath = this.optionValuePath;
		const selection = this.content.find( item =>
			   hasOwnProperty.call( item, optionValuePath )
			&& item[ optionValuePath ] === value
		);

		if ( selection !== undefined ) {
			set( this, "selection", selection );
		}
	}

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
	}

	/**
	 * Add new selection value observer and execute it to update value attribute
	 */
	_addSelectionValueObserver() {
		const selection = this.selection;
		if ( !selection ) { return; }

		const { optionValuePath } = this;
		const selectionValueObserver = () => {
			const value = selection[ optionValuePath ];
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
}
