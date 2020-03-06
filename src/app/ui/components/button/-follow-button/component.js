import Component from "@ember/component";
import { get, set } from "@ember/object";
import { on } from "@ember/object/evented";
import { inject as service } from "@ember/service";
import TwitchInteractButtonMixin from "ui/components/-mixins/twitch-interact-button";
import HotkeyMixin from "ui/components/-mixins/hotkey";
import layout from "./template.hbs";
import "./styles.less";


export default Component.extend( TwitchInteractButtonMixin, HotkeyMixin, {
	i18n: service(),

	layout,

	classNames: [
		"follow-button-component"
	],
	classNameBindings: [
		"isExpanded:expanded"
	],

	isExpanded: false,
	isPromptVisible: false,

	mouseLeaveTime: 1000,
	_timeout: null,

	hotkeysNamespace: "followbutton",
	hotkeys: {
		default() {
			this.mainbutton.dispatchEvent( new MouseEvent( "click", { bubbles: true } ) );
		},
		confirm() {
			this.confirmbutton.dispatchEvent( new MouseEvent( "click", { bubbles: true } ) );
		}
	},

	didInsertElement() {
		this._super( ...arguments );
		this.mainbutton = this.element.querySelector( ".main-button" );
		this.confirmbutton = this.element.querySelector( ".confirm-button" );
	},

	expand() {
		this._removeListener();
		set( this, "isExpanded", true );
		set( this, "isPromptVisible", true );
	},

	collapse() {
		set( this, "isExpanded", false );

		return new Promise( resolve => {
			this._listener = () => {
				this._listener = null;
				if ( this.isDestroyed ) {
					return;
				}
				set( this, "isPromptVisible", false );
				resolve();
			};
			this.confirmbutton.addEventListener(
				"webkitTransitionEnd",
				this._listener,
				{ once: true }
			);
		});
	},

	mouseEnter() {
		// expand when there was a timer (do cleanup) or during collapse transition
		if (
			   this._clearTimeout()
			|| !get( this, "isExpanded" ) && get( this, "isPromptVisible" )
		) {
			this.expand();
		}
	},

	mouseLeave() {
		this._clearTimeout();

		if ( !get( this, "isExpanded" ) ) {
			return;
		}

		this._timeout = setTimeout( () => {
			this._timeout = null;
			this.collapse();
		}, this.mouseLeaveTime );
	},

	_clearTimeout: on( "willDestroyElement", function() {
		if ( !this._timeout ) {
			return false;
		}

		clearTimeout( this._timeout );
		this._timeout = null;
		this._removeListener();

		return true;
	}),

	_removeListener() {
		if ( this._listener ) {
			this.confirmbutton.removeEventListener( "webkitTransitionEnd", this._listener );
			this._listener = null;
		}
	},


	actions: {
		expand() {
			this.expand();
		},

		collapse() {
			this.collapse();
		},

		follow( success, failure ) {
			if (
				   !this.modelName
				|| !get( this, "isValid" )
				|| get( this, "isLocked" )
				|| get( this, "record" )
			) {
				return;
			}
			set( this, "isLocked", true );

			const store = get( this, "store" );
			const id = get( this, "id" );

			// create a new record and save it
			store.createRecord( this.modelName, { id } )
				.save()
				.then( record => set( this, "record", record ) )
				.then( success, failure )
				.finally( () => set( this, "isLocked", false ) );
		},

		unfollow( success, failure ) {
			const record = get( this, "record" );

			if (
				   !record
				|| !get( this, "isValid" )
				|| get( this, "isLocked" )
			) {
				return;
			}
			set( this, "isLocked", true );

			// delete the record and save it
			record.destroyRecord()
				.then( () => {
					set( this, "record", false );
				})
				.then( success, failure )
				.then( () => this.collapse() )
				.finally( () => set( this, "isLocked", false ) );
		}
	}
});
