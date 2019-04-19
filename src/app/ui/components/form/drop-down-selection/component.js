import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { className, classNames, layout, tagName } from "@ember-decorators/component";
import { t } from "ember-i18n/decorator";
import template from "./template.hbs";


@layout( template )
@tagName( "div" )
@classNames( "drop-down-selection-component" )
export default class DropDownSelectionComponent extends Component {
	/** @type {I18nService} */
	@service i18n;

	@className
	class = "";

	@t( "components.drop-down-selection.placeholder" )
	_defaultPlaceholder;

	_placeholder = null;

	get placeholder() {
		return this._placeholder || this._defaultPlaceholder;
	}
	set placeholder( value ) {
		this._placeholder = value;
	}

	click() {
		this.action();

		return false;
	}
}
