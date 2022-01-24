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
	limit: 0,

	/**
	 * Don't fetch infinitely.
	 */
	maxAutoFetches: 3,

	/**
	 * Set by Twitch
	 */
	maxLimit: 100,


	/**
	 * Calculate how many items are needed to completely fill the container
	 * @param {string} itemSel
	 * @param {number?} maxRows
	 */
	calcFetchSize( itemSel, maxRows = Number.POSITIVE_INFINITY ) {
		const columns = getNeededColumns( itemSel );
		const rows = min( getNeededRows( itemSel ), maxRows );
		const remaining = this.offset % columns;

		return ( columns * rows ) + ( remaining > 0 ? columns - remaining : 0 );
	},

	setFetchSize() {
		const limit = this.calcFetchSize( this.itemSelector );
		set( this, "limit", min( limit, this.maxLimit ) );
	},


	async beforeModel() {
		await this._super( ...arguments );

		// reset offset value
		setProperties( this, {
			offset: 0,
			_filter: 0
		});
		this.setFetchSize();
	},

	setupController( controller ) {
		this._super( ...arguments );

		// offset (current model length)
		// setup oneWay computed property to the value of `contentPath`
		const { contentPath } = this;
		const path = `${contentPath}.length`;
		const computedOffset = computed( path, function() {
			return get( this, path );
		});
		defineProperty( this, "offset", computedOffset );

		const data = get( this, contentPath );
		this.calcHasFetchedAll( data, 0 );

		set( controller, "isFetching", false );
	},

	fetchContent() {
		return this.model();
	},


	/**
	 * @param {Object} data
	 * @returns {(number|null)}
	 */
	_getTotal( data ) {
		// try to get the "total" metadata value
		const { fetchMetadataPath } = this;
		if ( !data || !fetchMetadataPath ) {
			return null;
		}
		const total = get( data, fetchMetadataPath );
		const parsed = Number( total );
		if ( isNaN( parsed ) || parsed < 1 ) {
			return null;
		}
		return parsed;
	},

	calcHasFetchedAll( data, offset ) {
		const { controller, limit } = this;
		const length = data && data.length || 0;
		const total = this._getTotal( data );

		const hasFetchedAll
			// invalid or empty data
			= !length
			// has no metadata and not enough data to fill the whole request
			|| total === null && length < limit
			// has metadata and has fetched everything
			|| total !== null && offset + length >= total;
		set( controller, "hasFetchedAll", hasFetchedAll );
	},

	async willFetchContent( force ) {
		const { controller } = this;

		// we're already busy or finished fetching
		if ( controller.isFetching || controller.hasFetchedAll ) { return; }

		this.setFetchSize();

		const content = get( this, this.contentPath );
		const { offset, limit } = this;

		// don't fetch infinitely
		if ( !force && ( offset / limit ) > this.maxAutoFetches ) { return; }

		setProperties( controller, {
			isFetching: true,
			fetchError: false
		});

		try {
			// fetch content
			const data = await this.fetchContent();

			this.calcHasFetchedAll( data, offset );

			if ( data && data.length ) {
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

		willFetchContent() {
			return this.willFetchContent( ...arguments );
		}
	}
});
