import Component from "@ember/component";
import { inject as service } from "@ember/service";
import layout from "templates/components/modal/ModalServiceComponent.hbs";


export default Component.extend({
	modal: service(),

	layout
});
