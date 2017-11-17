import {
	get,
	set,
	assign,
	inject
} from "ember";
import { vars } from "config";
import FormButtonComponent from "components/button/FormButtonComponent";
import FilterLanguagesMixin from "routes/mixins/filter-languages";


const { service } = inject;
const { "random-max": randomMax } = vars;


export default FormButtonComponent.extend( FilterLanguagesMixin, {
	store: service(),
	streaming: service(),

	classNames: "btn-info",

	title: "Launch random stream",

	icon    : "fa-random",
	iconanim: true,
	spinner : true,

	model: "twitchStream",
	query: null,

	lock: false,

	action( success, failure ) {
		if ( get( this, "lock" ) ) { return; }
		set( this, "lock", true );

		const model = get( this, "model" );
		const store = get( this, "store" );

		let query = {
			// [0, max)
			offset              : Math.floor( Math.random() * randomMax ),
			limit               : 1,
			broadcaster_language: get( this, "broadcaster_language" )
		};

		let _query = get( this, "query" );
		if ( _query ) {
			query = assign( _query, query );
		}

		store.query( model, query )
			.then( streams => {
				// did we find a stream?
				let stream = get( streams, "firstObject" );
				if ( stream ) { return stream; }

				// if not, get number of streams in total
				let total = get( streams, "meta.total" );
				if ( !total ) { return Promise.reject(); }

				// decrease offset and query again [0, total)
				query.offset = Math.floor( Math.random() * total );
				return store.query( model, query )
					.then( streams => get( streams, "firstObject" ) );
			})
			.then( stream => {
				if ( !stream ) { throw new Error(); }

				if ( model === "twitchStreamFollowed" ) {
					return get( stream, "stream" );
				} else if ( model === "twitchStreamHosted" ) {
					return get( stream, "target" );
				} else {
					return stream;
				}
			})
			.then( stream => get( this, "streaming" ).startStream( stream ) )
			.then( success, failure )
			.finally( () => set( this, "lock", false ) );
	}
});
