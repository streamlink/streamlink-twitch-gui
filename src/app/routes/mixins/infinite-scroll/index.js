import {
	get,
	set,
	setProperties,
	defineProperty,
	computed,
	Mixin
} from "ember";
import {
	getNeededColumns,
	getNeededRows
} from "./css";


const { min } = Math;


export default Mixin.create({
	/**
	 * Define the content array location.
	 * Can't use a binding here!!!
	 */
	contentPath: "controller.model",

	/**
	 * Fetch offset
	 */
	offset: 0,
	filteredOffset: 0,

	/**
	 * Don't fetch infinitely.
	 */
	maxAutoFetches: 3,

	/**
	 * Set by Twitch
	 */
	maxLimit: 100,

	/**
	 * This is actually an ugly concept, but we need to set this data at the route, so we can
	 * control the fetch size before querying the data. The fetch size depends on the
	 * window size and css media queries containing this selector. We can't move this
	 * calculation to the view or to the controller, because they both aren't set up at the
	 * time where the size is being calculated...
	 */
	itemSelector: "",


	/**
	 * Calculate how many items are needed to completely fill the container
	 */
	calcFetchSize() {
		const itemSel = get( this, "itemSelector" );
		const offset = get( this, "offset" );
		const max = get( this, "maxLimit" );
		const columns = getNeededColumns( itemSel );
		const rows = getNeededRows( itemSel );
		const rest = offset % columns;

		const limit = min(
			// fetch size + number of items to fill the last row after a window resize
			( columns * rows ) + ( rest > 0 ? columns - rest : 0 ),
			// respect the max number of items
			max
		);

		set( this, "limit", limit );
	},


	beforeModel() {
		this._super( ...arguments );

		// reset offset value
		setProperties( this, {
			offset: 0,
			filteredOffset: 0
		});
		this.calcFetchSize();
	},

	setupController( controller, model ) {
		this._super( ...arguments );

		// offset (current model length)
		// setup oneWay computed property to the value of `contentPath`
		const contentPath = get( this, "contentPath" );
		const path = `${contentPath}.length`;
		const computedOffset = computed( path, "filteredOffset", () => {
			// increase model length by number of filtered records
			return get( this, path ) + get( this, "filteredOffset" );
		});
		defineProperty( this, "offset", computedOffset );


		const offset = get( this, "offset" );
		const limit  = get( this, "limit" );

		const hasFetchedAll = offset < limit;
		const initialFetchSize = get( model, "length" );

		setProperties( controller, {
			hasFetchedAll,
			initialFetchSize,
			isFetching: false
		});
	},

	fetchContent() {
		return this.model();
	},

	/**
	 * @param {(String|Function)} key
	 * @param {*} value
	 * @returns {function(Model[])}
	 */
	filterFetchedContent( key, value ) {
		return records => {
			const filtered = key instanceof Function
				? records.filter( key )
				: records.filterBy( key, value );

			const recordsLength = get( records, "length" );
			const filteredLength = get( filtered, "length" );
			const diff = recordsLength - filteredLength;

			// add to filteredOffset, so that next requests don't include the filtered records
			this.incrementProperty( "filteredOffset", diff );
			// reduce limit, so that the hasFetchedAll calculation keeps working
			this.decrementProperty( "limit", diff );

			return filtered;
		};
	},

	actions: {
		willTransition() {
			// offset: remove oneWay computed property and set value to 0
			defineProperty( this, "offset", {
				writable    : true,
				configurable: true,
				enumerable  : true,
				value       : 0
			});
			return true;
		},

		async willFetchContent( force ) {
			const controller = get( this, "controller" );
			const isFetching = get( controller, "isFetching" );
			const fetchedAll = get( controller, "hasFetchedAll" );

			// we're already busy or finished fetching
			if ( isFetching || fetchedAll ) { return; }

			this.calcFetchSize();

			const content = get( this, get( this, "contentPath" ) );
			const offset = get( this, "offset" );
			const limit = get( this, "limit" );
			const max = get( this, "maxAutoFetches" );
			const num = offset / limit;

			// don't fetch infinitely
			if ( !force && num > max ) { return; }

			setProperties( controller, {
				isFetching: true,
				fetchError: false
			});

			try {
				// fetch content
				const data = await this.fetchContent();
				// read limit again (in case it was modified by a filtered model)
				const limit = get( this, "limit" );
				const length = data
					? get( data, "length" )
					: 0;

				if ( !length || length < limit ) {
					set( controller, "hasFetchedAll", true );
				}
				if ( length ) {
					content.pushObjects( data );
				}

			} catch ( e ) {
				setProperties( controller, {
					fetchError: true,
					hasFetchedAll: false
				});

			} finally {
				set( controller, "isFetching", false );
			}
		}
	}
});
