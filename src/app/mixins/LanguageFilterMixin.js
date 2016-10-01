import {
	get,
	inject,
	Mixin
} from "Ember";


const { service } = inject;


export default Mixin.create({
	settings: service(),

	/**
	 * @returns {(string|undefined)}
	 */
	broadcaster_language: function() {
		if ( !get( this, "settings.gui_filterstreams" ) ) { return; }

		var filters = get( this, "settings.gui_langfilter" );
		if ( !filters ) { return; }

		var keys     = Object.keys( filters );
		var filtered = keys.filter(function( lang ) {
			return filters[ lang ];
		}, filters );

		// ignore everything (un)checked
		return filtered.length > 0 && filtered.length !== keys.length
			? filtered.join( "," )
			: undefined;
	}.property( "settings.gui_filterstreams", "settings.gui_langfilter" )
});
