import { set, action } from "@ember/object";
import { classNames, layout, tagName } from "@ember-decorators/component";
import SelectableComponent from "../-selectable/component";
import template from "./template.hbs";
import "./styles.less";


@layout( template )
@tagName( "div" )
@classNames( "radio-buttons-component" )
export default class RadioButtonsComponent extends SelectableComponent {
	@action
	change( item ) {
		set( this, "selection", item );
	}
}
