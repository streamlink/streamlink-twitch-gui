import { classNames } from "@ember-decorators/component";
import InputBtnComponent from "../-input-btn/component";


@classNames( "check-box-component" )
export default class CheckBoxComponent extends InputBtnComponent {
	click() {
		if ( this.disabled ) { return; }
		this.toggleProperty( "checked" );
	}
}
