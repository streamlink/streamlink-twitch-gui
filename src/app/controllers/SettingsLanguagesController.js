import {
	get,
	set,
	computed,
	Controller
} from "Ember";
import { langs } from "config";
import Settings from "models/localstorage/Settings";


export default Controller.extend({
	Settings,

	languages: computed(function() {
		return Object.keys( langs )
			.filter( code => !langs[ code ].disabled )
			.map( id => ({
				id,
				lang: langs[ id ][ "lang" ]
			}) );
	}),


	actions: {
		checkLanguages( all ) {
			let filters = get( this, "model.gui_langfilter" );
			Object.keys( filters.content )
				.forEach( key => set( filters, key, all ) );
		}
	}
});
