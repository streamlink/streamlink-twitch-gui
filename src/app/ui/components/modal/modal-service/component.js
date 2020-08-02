import Component from "@ember/component";
import { inject as service } from "@ember/service";
import layout from "./template.hbs";
import "./styles.less";


export default Component.extend({
	/** @type {ModalService} */
	modal: service(),

	layout,
	classNames: "modal-service-component",
	classNameBindings: [ "modal.isModalOpened:active" ]
});
