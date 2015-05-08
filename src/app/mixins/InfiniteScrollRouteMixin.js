define( [ "ember" ], function( Ember ) {

	var	get = Ember.get,
		set = Ember.set;


	var	CSSMediaRule		= window.CSSMediaRule,
		CSSStyleRule		= window.CSSStyleRule,
		reMinWidth			= /^(?:\(max-width:\s*\d+px\)\s*and\s*)?\(min-width:\s*(\d+)px\)$/,
		cachedMinWidths		= {},
		cssMinWidthRules	= [].filter.call( document.styleSheets[0].rules, function( rule ) {
			return	rule instanceof CSSMediaRule
				&&	rule.media.length === 1
				&&	reMinWidth.test( rule.media[0] )
				&&	rule.cssRules.length > 0;
		}),
		cachedMinHeights	= [].filter.call( document.styleSheets[0].rules, function( rule ) {
			return	rule instanceof CSSStyleRule
				&&	rule.style.minHeight !== "";
		}).reduce(function( cache, rule ) {
			cache[ rule.selectorText ] = parseInt( rule.style.minHeight );
			return cache;
		}, {} );

	/**
	 * Generate a list of all min-width media queries and their item widths for a specific selector.
	 * These media queries have been defined by the lesscss function .dynamic-elems-per-row()
	 */
	function readMinWidths( selector ) {
		if ( cachedMinWidths.hasOwnProperty( selector ) ) {
			return cachedMinWidths[ selector ];
		}

		var data = cssMinWidthRules
			.filter(function( rule ) {
				return rule.cssRules[0].selectorText === selector;
			})
			.map(function( rule ) {
				return {
					minWidth: Math.floor( reMinWidth.exec( rule.media[0] )[1] ),
					numItems: Math.floor( 100 / parseInt( rule.cssRules[0].style.width ) )
				};
			});

		if ( !data.length ) {
			throw new Error( "Invalid selector" );
		}

		return ( cachedMinWidths[ selector ] = data );
	}

	function readMinHeights( selector ) {
		if ( !cachedMinHeights.hasOwnProperty( selector ) ) {
			throw new Error( "Invalid selector" );
		}
		return cachedMinHeights[ selector ];
	}

	function getNeededColumns( selector ) {
		return readMinWidths( selector ).reduce(function( current, next ) {
			return window.innerWidth < next.minWidth
				? current
				: next;
		}).numItems;
	}

	function getNeededRows( selector ) {
		var minHeight = readMinHeights( selector );
		return 1 + Math.ceil( getItemContainer().clientHeight / minHeight );
	}

	function getItemContainer() {
		// the route's view hasn't been inserted yet: choose the parent element
		return	document.querySelector( "body > .wrapper" )
			||	document.body;
	}


	return Ember.Mixin.create({
		/**
		 * Define the content array location.
		 * Can't use a binding here!!!
		 */
		contentPath: "controller.model",

		/**
		 * Don't fetch infinitely.
		 */
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
		 * Calculate how many items are needed to completely fill the container
		 */
		calcFetchSize: function() {
			var	itemSel	= get( this, "itemSelector" ),
				columns	= getNeededColumns( itemSel ),
				rows	= getNeededRows( itemSel ),
				offset	= get( this, "offset" ),
				uneven	= offset % columns,
				limit	= ( columns * rows ) + ( uneven > 0 ? columns - uneven : 0 );

			// fetch size + number of items to fill the last row after a window resize
			set( this, "limit", limit );
		},


		beforeModel: function() {
			this._super.apply( this, arguments );

			// reset on route change
			set( this, "offset", 0 );
			this.calcFetchSize();
		},

		setupController: function( controller ) {
			this._super.apply( this, arguments );

			// late bindings
			var binding = get( this, "_binding_offset" );
			if ( !binding ) {
				binding = Ember.Binding.from(
					"%@.length".fmt( get( this, "contentPath" ) )
				).to( "offset" );
				set( this, "_binding_offset", binding );
			}
			binding.connect( this );

			var	offset	= get( this, "offset" ),
				limit	= get( this, "limit" );

			set( controller, "isFetching", false );
			set( controller, "hasFetchedAll", offset < limit );
		},

		fetchContent: function() {
			return this.model();
		},

		actions: {
			"willTransition": function () {
				var binding = get( this, "_binding_offset" );
				if ( binding ) {
					binding.disconnect( this );
				}
			},

			"willFetchContent": function( force ) {
				var	controller	= get( this, "controller" ),
					isFetching	= get( controller, "isFetching" ),
					fetchedAll	= get( controller, "hasFetchedAll" );

				// we're already busy or finished fetching
				if ( isFetching || fetchedAll ) { return; }

				this.calcFetchSize();

				var	content	= get( this, get( this, "contentPath" ) ),
					offset	= get( this, "offset" ),
					limit	= get( this, "limit" ),
					max		= get( this, "maxAutoFetches" ),
					num		= offset / limit;

				// don't fetch infinitely
				if ( !force && num > max ) { return; }

				set( controller, "fetchError", false );
				set( controller, "isFetching", true );

				// fetch content
				this.fetchContent()
					.then(function( data ) {
						if ( !data || !data.length || data.length < limit ) {
							set( controller, "hasFetchedAll", true );
						}
						if ( data && data.length ) {
							content.pushObjects( data );
						}
						set( controller, "isFetching", false );
					})
					.catch(function( err ) {
						set( controller, "fetchError", true );
						set( controller, "isFetching", false );
						set( controller, "hasFetchedAll", false );
						return Promise.reject( err );
					});
			}
		}
	});

});
