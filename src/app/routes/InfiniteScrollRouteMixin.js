define( [ "ember" ], function( Ember ) {

	var	get = Ember.get,
		set = Ember.set;


	var	cachedMinWidths	= {},
		reMinWidth		= /^(?:\(max-width: \d+px\) and )?\(min-width: (\d+)px\)$/,
		cssMediaRules	= [].slice.call( document.styleSheets[0].rules )
			.filter(function( rule ) {
				return	rule instanceof window.CSSMediaRule
					&&	rule.media.length === 1
					&&	reMinWidth.test( rule.media[0] )
					&&	rule.cssRules.length > 0;
			});

	/**
	 * Generate a list of all min-width media queries and their item widths for a specific selector.
	 * These media queries have been defined by the lesscss function .dynamic-elems-per-row()
	 */
	function readMinWidths( selector ) {
		var data;

		if ( cachedMinWidths.hasOwnProperty( selector ) ) {
			return cachedMinWidths[ selector ];
		}

		data = cssMediaRules
			.filter(function( rule ) {
				return rule.cssRules[0].selectorText === selector;
			})
			.map(function( rule ) {
				return {
					minWidth: Math.floor(
						reMinWidth.exec( rule.media[0] )[1]
					),
					numItems: Math.floor( 100 / Number(
						rule.cssRules[0].style[ "width" ].slice( 0, -1 )
					) )
				};
			});

		if ( !data.length ) {
			throw new Error( "Invalid selector" );
		}

		// set cache
		return cachedMinWidths[ selector ] = data;
	}

	function getNeededColumns( selector ) {
		return readMinWidths( selector ).reduce(function( current, next ) {
			return window.innerWidth < next.minWidth
				? current
				: next;
		}).numItems;
	}

	function getNeededRows( itemHeight ) {
		return 1 + Math.ceil( getItemContainer().clientHeight / itemHeight );
	}

	function getItemContainer() {
		// the route's view hasn't been inserted yet: choose the parent element
		return	document.querySelector( "body > .wrapper" )
			||	document.body;
	}


	return Ember.Mixin.create({
		offset: 0,
		limit: 12,
		maxAutoFetches: 3,

		/**
		 * This is actually an ugly concept, but we need to set this data at the route, so we can
		 * control the fetch size before querying the data. The fetch size depends on the
		 * window size and css media queries containing this selector. We can't move this
		 * calculation to the view or to the controller, because they both aren't set up at the
		 * time where the size is being calculated...
		 */
		itemSelector: Ember.required(),
		/**
		 * Second part of the fetch size calculation: the height of an item is unknown at this
		 * point, but we need to know how many items to fetch. This property holds the minimum
		 * height of an item of the selector specified above.
		 */
		itemHeight: Ember.required(),


		/**
		 * Calculate how many items are needed to completely fill the container
		 */
		calcFetchSize: function() {
			var	columns	= getNeededColumns( get( this, "itemSelector" ) ),
				rows	= getNeededRows( get( this, "itemHeight" ) ),
				offset	= get( this, "offset" ),
				uneven	= offset % columns,
				limit	= ( columns * rows ) + ( uneven > 0 ? columns - uneven : 0 );

			// fetch size + number of items to fill the last row after a window resize
			set( this, "limit", limit );
		},


		beforeModel: function() {
			this._super.apply( this, arguments );

			set( this, "offset", 0 );
			this.calcFetchSize();
		},

		setupController: function( controller, model ) {
			var	num	= get( model, "length" ),
				max	= get( this, "limit" );

			this._super.apply( this, arguments );

			set( controller, "isFetching", false );
			set( controller, "hasFetchedAll", num < max );
		},

		fetchContent: function() {
			this.calcFetchSize();
			return this.model()
				.catch(function( err ) {
					set( this, "offset", get( this, "offset" ) - get( this, "limit" ) );
					set( this, "controller.fetchError", true );
					set( this, "controller.isFetching", false );
					set( this, "controller.hasFetchedAll", false );
					return Promise.reject( err );
				}.bind( this ) );
		},

		actions: {
			"willFetchContent": function( force ) {
				var	controller	= get( this, "controller" ),
					isFetching	= get( controller, "isFetching" ),
					fetchedAll	= get( controller, "hasFetchedAll" );

				if ( !isFetching && !fetchedAll ) {
					var	offset	= get( this, "offset" ),
						limit	= get( this, "limit" ),
						max		= get( this, "maxAutoFetches" ),
						num		= offset / limit;

					// don't fetch more than 3 times automatically
					if ( !force && num > max ) { return; }

					set( controller, "fetchError", false );
					set( controller, "isFetching", true );
					set( this, "offset", offset + limit );

					// fetch content and append to ArrayController
					this.fetchContent().then(function( content ) {
						if ( !content || !content.length ) {
							set( controller, "hasFetchedAll", true );
						} else {
							controller.pushObjects( content );
						}
						set( controller, "isFetching", false );
					}.bind( this ) );
				}
			}
		}
	});

});
