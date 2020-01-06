import Component from "@ember/component";
import { get, set, setProperties, computed } from "@ember/object";
import { scheduleOnce } from "@ember/runloop";
import { inject as service } from "@ember/service";
import isFocused from "utils/is-focused";
import layout from "./template.hbs";
import "./styles.less";


const IGNORED_EVENT_CODES = [
	undefined,
	null,
	"AltLeft",
	"AltRight",
	"ControlLeft",
	"ControlRight",
	"MetaLeft",
	"MetaRight",
	"OSLeft",
	"OSRight",
	"ShiftLeft",
	"ShiftRight",
	"CapsLock",
	"NumLock",
	"ScrollLock",
	"PrintScreen",
	"Pause",
	"ContextMenu"
];


export default Component.extend( /** @class SettingsHotkeyComponent */ {
	/** @type {HotkeyService} */
	hotkeyService: service( "hotkey" ),
	/** @type {I18nService} */
	i18n: service(),

	layout,
	classNames: [ "settings-hotkey-component" ],

	editing: false,

	init() {
		this._super( ...arguments );
		// initialize computed property of injected service to make the observer work
		this.get( "i18n" );
	},

	// needed for proper two-way binding
	enabled: computed( "model.disabled", {
		get() {
			return !get( this, "model.disabled" );
		},
		set( key, value ) {
			set( this, "model.disabled", !value );
			return value;
		}
	}),

	_hotkeyString: computed( "model.code", "hotkey", "i18n.locale", function() {
		return get( this, "model.code" )
			? this.hotkeyService.formatTitle( this.model )
			: this.hotkey
				? this.hotkeyService.formatTitle( this.hotkey )
				: this.i18n.t( "components.settings-hotkey.empty" );
	}),

	_inputValue: computed( "editing", "_inputEvent", "_hotkeyString", function() {
		return this.editing && this._inputEvent
			? this.hotkeyService.formatTitle( this._inputEvent )
			: this._hotkeyString;
	}),

	/** @property {(KeyboardEvent|null)} event */
	_inputEvent: null,

	/** @param {Event} event */
	_stopEvent( event ) {
		event.preventDefault();
		event.stopImmediatePropagation();
	},

	_stopEditing() {
		setProperties( this, {
			editing: false,
			_inputEvent: null
		});
	},

	didInsertElement() {
		this._super( ...arguments );
		this._input = this.element.querySelector( "input" );
	},

	actions: {
		/** @this {SettingsHotkeyComponent} */
		edit() {
			set( this, "editing", true );
			scheduleOnce( "afterRender", () => {
				this._input.focus();
			});
		},
		/** @this {SettingsHotkeyComponent} */
		delete() {
			setProperties( this.model, {
				code: null,
				altKey: false,
				ctrlKey: false,
				metaKey: false,
				shiftKey: false
			});
		},
		/** @this {SettingsHotkeyComponent} */
		discard() {
			this._stopEditing();
		},
		/** @this {SettingsHotkeyComponent} */
		confirm() {
			if ( this._inputEvent ) {
				const { code, altKey, ctrlKey, metaKey, shiftKey } = this._inputEvent;
				setProperties( this.model, { code, altKey, ctrlKey, metaKey, shiftKey } );
			}
			this._stopEditing();
		},
		/**
		 * @param {KeyboardEvent} event
		 * @this {SettingsHotkeyComponent}
		 */
		change( event ) {
			if ( !isFocused( this._input ) ) { return; }
			this._stopEvent( event );
			if ( IGNORED_EVENT_CODES.includes( event.code ) ) { return; }
			set( this, "_inputEvent", event );
		}
	}
});
