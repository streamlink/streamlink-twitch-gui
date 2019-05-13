import Component from "@ember/component";
import { attribute, classNames, layout, tagName } from "@ember-decorators/component";
import { on } from "@ember-decorators/object";
import template from "./template.hbs";
import "./styles.less";


@layout( template )
@tagName( "svg" )
@classNames( "loading-spinner-component" )
export default class LoadingSpinnerComponent extends Component {
	@attribute
	viewBox = "0 0 1 1";

	@on( "didInsertElement" )
	_setRadiusAttribute() {
		let circle = this.element.querySelector( "circle" );
		let strokeWidth = window.getComputedStyle( circle ).strokeWidth;
		let radius = 50 - parseFloat( strokeWidth );
		circle.setAttribute( "r", `${radius}%` );
	}
}
