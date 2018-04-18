import Component from "@ember/component";
import { get, set } from "@ember/object";
import { on } from "@ember/object/evented";
import { cancel, later } from "@ember/runloop";
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

	hotkeys: [
		{
			name: "main",
			code: "KeyF",
			action() {
				this.$( ".main-button" ).click();
			}
		},
		{
			name: "confirm",
			code: "KeyF",
			ctrlKey: true,
			action() {
				this.$( ".confirm-button" ).click();
			}
		}
	],

	didInsertElement() {
		this._super( ...arguments );
		this.$confirmbutton = this.$( ".confirm-button" );
	},

	expand() {
		this.$confirmbutton.off( "webkitTransitionEnd" );
		set( this, "isExpanded", true );
		set( this, "isPromptVisible", true );
	},

	collapse() {
		set( this, "isExpanded", false );

		return new Promise( r => this.$confirmbutton.one( "webkitTransitionEnd", () => {
			if ( get( this, "isDestroyed" ) ) {
				return;
			}
			set( this, "isPromptVisible", false );
			r();
		}) );
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

		let time = get( this, "mouseLeaveTime" );
		this._timeout = later( () => {
			this._timeout = null;
			this.collapse();
		}, time || 1000 );
	},

	_clearTimeout: on( "willDestroyElement", function() {
		if ( !this._timeout ) {
			return false;
		}

		cancel( this._timeout );
		this._timeout = null;
		this.$confirmbutton.off( "webkitTransitionEnd" );

		return true;
	}),


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

			const store = get( this, "store" );

			// delete the record and save it
			record.destroyRecord()
				.then( () => {
					set( this, "record", false );
					// also unload it
					store.unloadRecord( record );
				})
				.then( success, failure )
				.then( () => this.collapse() )
				.finally( () => set( this, "isLocked", false ) );
		}
	}
});
