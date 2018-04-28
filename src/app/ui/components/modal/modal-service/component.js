import Component from "@ember/component";
import { inject as service } from "@ember/service";
import layout from "./template.hbs";


export default Component.extend({
	modal: service(),

	layout
});
