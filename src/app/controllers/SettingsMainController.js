import {
	computed,
	Controller
} from "ember";
import { themes } from "config";


const { themes: themesList } = themes;


export default Controller.extend({
	contentGuiTheme: computed(function() {
		return themesList.map( id => {
			const label = id.substr( 0, 1 ).toUpperCase() + id.substr( 1 );

			return { id, label };
		});
	})
});
