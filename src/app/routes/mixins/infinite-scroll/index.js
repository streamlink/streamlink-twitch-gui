import { get, set, setProperties, defineProperty, computed } from "@ember/object";
import Mixin from "@ember/object/mixin";
import { getNeededColumns, getNeededRows } from "./css";


const { min } = Math;


export default Mixin.create({
	/**
	 * Define the content array location.
	 * The content path value is used as a dependency of the dynamic computed offset property.
	 */
	contentPath: "controller.model",

	/**
	 * Define an item selector, so the fetch size can be calculated before querying the data.
	 * The fetch size depends on the window size and css media queries containing this selector.
	 * Since controllers and components are not set up yet, this needs to be set on the route.
	 */
	itemSelector: "",

	/**
	 * Metadata path of a returned fetchContent() array.
	 * This may not always be available.
	 */
	fetchMetadataPath: "meta.total",

	/**
	 * Fetch parameters
	 * Offset will be turned into a computed property on controller initialization.
	 */
	offset: 0,
	_limit: 0,
	_filter: 0,

	/**
	 * Don't fetch infinitely.
	 */
	maxAutoFetches: 3,

	/**
	 * Set by Twitch
	 */
	maxLimit: 100,


	limit: computed( "_limit", "_filter", function() {
		return get( this, "_limit" ) + get( this, "_filter" );
	}),


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

		set( this, "_limit", limit );
	},


	async beforeModel() {
		await this._super( ...arguments );

		// reset offset value
		setProperties( this, {
			offset: 0,
			_filter: 0
		});
		this.calcFetchSize();
	},

	setupController( controller ) {
		this._super( ...arguments );

		// offset (current model length)
		// setup oneWay computed property to the value of `contentPath`
		const contentPath = get( this, "contentPath" );
		const path = `${contentPath}.length`;
		const computedOffset = computed( path, "_filter", () => {
			// increase model length by number of filtered records
			return get( this, path ) + get( this, "_filter" );
		});
		defineProperty( this, "offset", computedOffset );

		// length=offset on the first fetch
		const length = get( this, "offset" );
		const limit = get( this, "limit" );
		const data = get( this, contentPath );
		const total = this._getTotal( data );
		const hasFetchedAll = this._calcHasFetchedAll( length, 0, limit, total );

		setProperties( controller, {
			hasFetchedAll,
			isFetching: false
		});
	},

	fetchContent() {
		return this.model();
	},

	/**
	 * @param {Model[]} records
	 * @param {(String|Function)} key
	 * @param {*} [value]
	 * @returns {Model[]}
	 */
	filterFetchedContent( records, key, value ) {
		const filtered = key instanceof Function
			? records.filter( key )
			: records.filterBy( key, value );

		const recordsLength = get( records, "length" );
		const filteredLength = get( filtered, "length" );
		const diff = recordsLength - filteredLength;

		// add to filteredOffset, so that next requests don't include the filtered records
		// reduce limit, so that the hasFetchedAll calculation keeps working
		this.incrementProperty( "_filter", diff );

		return filtered;
	},


	/**
	 * @param {Object} data
	 * @returns {(number|null)}
	 */
	_getTotal( data ) {
		// try to get the "total" metadata value
		const metadataPath = get( this, "fetchMetadataPath" );
		if ( !data || !metadataPath ) {
			return null;
		}
		const total = get( data, metadataPath );
		if ( total === null ) {
			return null;
		}
		const parsed = Number( total );
		if ( isNaN( parsed ) || parsed < 1 ) {
			return null;
		}
		return parsed;
	},

	_calcHasFetchedAll( length, offset, limit, total ) {
		// invalid or empty data
		return !length
			// has no metadata and not enough data to fill the whole request
			|| total === null && length < limit
			// has metadata and has fetched everything
			|| total !== null && offset + length >= total;
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
				const total = this._getTotal( data );

				if ( this._calcHasFetchedAll( length, offset, limit, total ) ) {
					set( controller, "hasFetchedAll", true );
				}

				// fix offset if content was missing from the response (banned channels, etc.)
				if ( total !== null && length < limit && offset + length < total ) {
					this.incrementProperty( "_filter", limit - length );
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
