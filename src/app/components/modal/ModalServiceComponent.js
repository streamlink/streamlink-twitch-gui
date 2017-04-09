import {
	inject,
	Component
} from "ember";
import layout from "templates/components/modal/ModalServiceComponent.hbs";


const { service } = inject;


export default Component.extend({
	modal: service(),

	layout
});
