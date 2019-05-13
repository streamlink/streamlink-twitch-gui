import Component from "@ember/component";
import { set } from "@ember/object";
import { className, classNames, layout } from "@ember-decorators/component";
import { observes, on } from "@ember-decorators/object";
import { cancel, later } from "@ember/runloop";
import template from "./template.hbs";
import "./styles.less";


@layout( template )
@classNames( "settings-submit-component" )
export default class SettingsSubmitComponent extends Component {
	isDirty = true;
	disabled = false;

	delay = 1000;

	@className( "", "faded" )
	_enabled = false;

	apply() {}
	discard() {}

	@on( "init" )
	_onInit() {
		set( this, "_enabled", this.isDirty && !this.disabled );
	}

	// immediately set enabled when disabled property changes
	@observes( "disabled" )
	_disabledObserver() {
		const enabled = this.disabled
			? false
			: this.isDirty;
		set( this, "_enabled", enabled );
	}

	// isDirty === true:  immediately set enabled to true
	// isDirty === false: wait and then set to false
	_timeout = null;
	@observes( "isDirty" )
	_isDirtyObserver() {
		if ( this.disabled ) { return; }

		this._clearTimeout();

		if ( this.isDirty ) {
			set( this, "_enabled", true );
		} else {
			this._timeout = later( () => {
				set( this, "_enabled", false );
				this._timeout = null;
			}, this.delay );
		}
	}

	@on( "willDestroyElement" )
	_clearTimeout() {
		if ( this._timeout ) {
			cancel( this._timeout );
			this._timeout = null;
		}
	}
}
