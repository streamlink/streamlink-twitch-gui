import { get } from "@ember/object";
import { on } from "@ember/object/evented";
import Mixin from "@ember/object/mixin";
import { addObserver, removeObserver } from "@ember/object/observers";
import { debounce } from "@ember/runloop";
import { inject as service } from "@ember/service";
import { default as nwWindow, window as Window } from "nwjs/Window";


const { hasOwnProperty } = {};
const { Date } = Window;


export const PROP_LAST = "_refreshFocusLast";
export const PROP_DEFER = "_refreshFocusDefer";
export const TIME_DEBOUNCE = 20;


export default Mixin.create({
	modal: service(),
	settings: service(),

	_refreshOnActivate: on( "activate", function() {
		// already set up?
		if ( hasOwnProperty.call( this, PROP_LAST ) ) { return; }

		this[ PROP_LAST ] = null;
		this[ PROP_DEFER ] = false;
		this._refreshListenersAdd();
		addObserver( this, "modal.isModalOpened", this, this._refreshModalObserver );
	}),

	_refreshOnDeactivate: on( "deactivate", function() {
		removeObserver( this, "modal.isModalOpened", this, this._refreshModalObserver );
		this._refreshListenersRemove();
		delete this[ PROP_LAST ];
		delete this[ PROP_DEFER ];
	}),

	_refreshListenersAdd() {
		this._refreshListenersRemove();

		this._refreshListenerFocusGain = () =>
			// ignore multiple "simultaneous" restore/focus events
			debounce( this, this._refreshOnFocusGain, TIME_DEBOUNCE );
		this._refreshListenerFocusLoss = () =>
			// ignore multiple "simultaneous" minimize/blur events
			debounce( this, this._refreshOnFocusLoss, TIME_DEBOUNCE );

		nwWindow.on( "focus", this._refreshListenerFocusGain );
		nwWindow.on( "restore", this._refreshListenerFocusGain );
		nwWindow.on( "blur", this._refreshListenerFocusLoss );
		nwWindow.on( "minimize", this._refreshListenerFocusLoss );
	},

	_refreshListenersRemove() {
		const { _refreshListenerFocusGain, _refreshListenerFocusLoss } = this;
		if ( _refreshListenerFocusGain ) {
			nwWindow.removeListener( "focus", _refreshListenerFocusGain );
			nwWindow.removeListener( "restore", _refreshListenerFocusGain );
			this._refreshListenerFocusGain = null;
		}
		if ( _refreshListenerFocusLoss ) {
			nwWindow.removeListener( "blur", _refreshListenerFocusLoss );
			nwWindow.removeListener( "minimize", _refreshListenerFocusLoss );
			this._refreshListenerFocusLoss = null;
		}
	},

	_refreshOnFocusGain() {
		const last = this[ PROP_LAST ];
		const time = get( this, "settings.gui.focusrefresh" );
		if ( !time || !last || Date.now() < last + time ) { return; }

		// defer the refresh if a modal dialog is opened
		if ( get( this, "modal.isModalOpened" ) ) {
			this[ PROP_DEFER ] = true;
		} else {
			this.refresh();
		}
	},

	_refreshOnFocusLoss() {
		this[ PROP_LAST ] = Date.now();
	},

	_refreshModalObserver() {
		if ( this[ PROP_DEFER ] && !get( this, "modal.isModalOpened" ) ) {
			this.refresh();
		}
	},

	refresh() {
		this[ PROP_DEFER ] = false;
		return this._super( ...arguments );
	}
});
