import {
	get,
	computed,
	inject,
	Mixin
} from "ember";


const { service } = inject;


export default Mixin.create({
	settings: service(),

	broadcaster_language: computed(
		"settings.gui_filterstreams",
		"settings.gui_langfilter",
		function() {
			if ( !get( this, "settings.gui_filterstreams" ) ) { return; }

			let filters = get( this, "settings.gui_langfilter" );
			if ( !filters ) { return; }
			filters = filters.toJSON();

			const keys = Object.keys( filters );
			const filtered = keys.filter(function( lang ) {
				return filters[ lang ];
			});

			// ignore everything (un)checked
			return filtered.length > 0 && filtered.length !== keys.length
				? filtered.join( "," )
				: undefined;
		}
	)
});
