import { classNames } from "@ember-decorators/component";
import InputBtnComponent from "../-input-btn/component";


@classNames( "radio-buttons-item-component" )
export default class RadioButtonsItemComponent extends InputBtnComponent {
	click() {
		if ( this.disabled ) { return; }
		this.action();
	}
}
