import {
	get,
	addObserver,
	removeObserver,
	inject,
	run,
	on,
	Mixin
} from "ember";
import nwWindow from "nwjs/Window";


const { service } = inject;
const { debounce } = run;


export const PROP_LAST = "_refreshFocusLast";
export const PROP_DEFER = "_refreshFocusDefer";


const TIME_DEBOUNCE = 20;

let listenerFocusGain;
let listenerFocusLoss;

function addListeners( focusGain, focusLoss ) {
	removeListeners();

	listenerFocusGain = focusGain;
	listenerFocusLoss = focusLoss;

	nwWindow.on( "focus", focusGain );
	nwWindow.on( "restore", focusGain );
	nwWindow.on( "blur", focusLoss );
	nwWindow.on( "minimize", focusLoss );
}

function removeListeners() {
	if ( listenerFocusGain ) {
		nwWindow.removeListener( "focus", listenerFocusGain );
		nwWindow.removeListener( "restore", listenerFocusGain );
	}
	if ( listenerFocusLoss ) {
		nwWindow.removeListener( "blur", listenerFocusLoss );
		nwWindow.removeListener( "minimize", listenerFocusLoss );
	}
}


export default Mixin.create({
	modal: service(),
	settings: service(),

	_refreshOnActivate: on( "activate", function() {
		// already set up?
		if ( this.hasOwnProperty( PROP_LAST ) ) {
			return;
		}

		this[ PROP_LAST ] = null;
		this[ PROP_DEFER ] = false;

		addListeners(
			() => this._refreshOnFocusGain(),
			() => this._refreshOnFocusLoss()
		);

		addObserver( this, "modal.isModalOpened", this, this._refreshModalObserver );
	}),

	_refreshOnDeactivate: on( "deactivate", function() {
		removeObserver( this, "modal.isModalOpened", this, this._refreshModalObserver );
		removeListeners();
		delete this[ PROP_LAST ];
		delete this[ PROP_DEFER ];
	}),

	_refreshOnFocusGain() {
		// ignore multiple "simultaneous" restore/focus events
		debounce( this, this._refreshFocusGain, TIME_DEBOUNCE );
	},

	_refreshOnFocusLoss() {
		// ignore multiple "simultaneous" minimize/blur events
		debounce( this, this._refreshFocusLoss, TIME_DEBOUNCE );
	},

	_refreshFocusGain() {
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

	_refreshFocusLoss() {
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
