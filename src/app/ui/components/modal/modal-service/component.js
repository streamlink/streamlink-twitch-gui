import Component from "@ember/component";
import { readOnly } from "@ember/object/computed";
import { className, classNames, layout } from "@ember-decorators/component";
import { inject as service } from "@ember/service";
import template from "./template.hbs";
import "./styles.less";


@layout( template )
@classNames( "modal-service-component" )
export default class ModalServiceComponent extends Component {
	/** @type {ModalService} */
	@service modal;

	@className( "active" )
	@readOnly( "modal.isModalOpened" )
	isActive
}
