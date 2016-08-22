import Ember from "Ember";


	var get = Ember.get;
	var set = Ember.set;


	var CSSMediaRule     = window.CSSMediaRule;
	var CSSStyleRule     = window.CSSStyleRule;
	var reMinWidth       = /^(?:\(max-width:\s*\d+px\)\s*and\s*)?\(min-width:\s*(\d+)px\)$/;
	var cachedMinWidths  = {};

	var styleSheetsRules = [].reduce.call( document.styleSheets, function( rules, stylesheet ) {
		rules.push.apply( rules, stylesheet.rules );
		return rules;
	}, [] );

	var cssMinWidthRules = [].filter.call( styleSheetsRules, function( rule ) {
		return rule instanceof CSSMediaRule
		    && rule.media.length === 1
		    && reMinWidth.test( rule.media[0] )
		    && rule.cssRules.length > 0;
	});
	var cachedMinHeights = [].filter.call( styleSheetsRules, function( rule ) {
		return rule instanceof CSSStyleRule
		    && rule.style.minHeight !== "";
	}).reduce(function( cache, rule ) {
		cache[ rule.selectorText ] = parseInt( rule.style.minHeight, 10 );
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

		var data = cssMinWidthRules.filter(function( rule ) {
			return rule.cssRules[0].selectorText === selector;
		});

		if ( !data.length ) {
			throw new Error( "Invalid selector" );
		}

		data = data.map( function( rule ) {
			return {
				minWidth: Math.floor( reMinWidth.exec( rule.media[0] )[1] ),
				numItems: Math.floor( 100 / parseInt( rule.cssRules[0].style.width ) )
			};
		});

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
		return document.querySelector( "body > .wrapper" )
		    || document.body;
	}


	export default Ember.Mixin.create({
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
		calcFetchSize: function() {
			var itemSel = get( this, "itemSelector" );
			var offset  = get( this, "offset" );
			var max     = get( this, "maxLimit" );
			var columns = getNeededColumns( itemSel );
			var rows    = getNeededRows( itemSel );
			var uneven  = offset % columns;

			// fetch size + number of items to fill the last row after a window resize
			var limit   = ( columns * rows ) + ( uneven > 0 ? columns - uneven : 0 );

			set( this, "limit", Math.min( limit, max ) );
		},


		beforeModel: function() {
			this._super.apply( this, arguments );

			// reset on route change
			set( this, "offset", 0 );
			this.calcFetchSize();
		},

		setupController: function( controller, model ) {
			this._super.apply( this, arguments );

			// late bindings
			var binding = get( this, "_binding_offset" );
			if ( !binding ) {
				var contentPath = get( this, "contentPath" );
				binding = Ember.Binding.from( contentPath + ".length" ).to( "offset" );
				set( this, "_binding_offset", binding );
			}
			binding.connect( this );

			var offset = get( this, "offset" );
			var limit  = get( this, "limit" );

			set( controller, "isFetching", false );
			set( controller, "hasFetchedAll", offset < limit );
			set( controller, "initialFetchSize", model.length );
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
				return true;
			},

			"willFetchContent": function( force ) {
				var controller = get( this, "controller" );
				var isFetching = get( controller, "isFetching" );
				var fetchedAll = get( controller, "hasFetchedAll" );

				// we're already busy or finished fetching
				if ( isFetching || fetchedAll ) { return; }

				this.calcFetchSize();

				var content = get( this, get( this, "contentPath" ) );
				var offset  = get( this, "offset" );
				var limit   = get( this, "limit" );
				var max     = get( this, "maxAutoFetches" );
				var num     = offset / limit;

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
