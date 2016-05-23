define([
	"Ember",
	"hbs!templates/components/list/InfiniteScrollComponent"
], function(
	Ember,
	layout
) {

	var get = Ember.get;
	var set = Ember.set;
	var alias = Ember.computed.alias;
	var or = Ember.computed.or;

	var $ = Ember.$;
	var $window = $( window );

	var document = window.document;
	var documentElement = document.documentElement;
	var getComputedStyle = window.getComputedStyle;


	return Ember.Component.extend({
		layout: layout,
		tagName: "button",
		classNameBindings: [
			":btn",
			":btn-with-icon",
			":infinite-scroll-component",
			"hasFetchedAll:hidden"
		],
		attributeBindings: [
			"type",
			"locked:disabled"
		],

		scrollThreshold: 2 / 3,
		scrollListener : null,

		type: "button",
		locked: or( "isFetching", "hasFetchedAll" ),
		error: alias( "targetObject.fetchError" ),

		isFetching: alias( "targetObject.isFetching" ),
		hasFetchedAll: alias( "targetObject.hasFetchedAll" ),

		click: function() {
			var targetObject = get( this, "targetObject" );
			targetObject.send( "willFetchContent", true );
		},


		didInsertElement: function() {
			this._super.apply( this, arguments );

			// find first parent node which has a scroll bar
			var overflow;
			var parent = get( this, "element" );
			while ( ( parent = parent.parentNode ) ) {
				if ( parent.clientHeight >= parent.scrollHeight ) {
					continue;
				}
				overflow = getComputedStyle( parent, "" ).getPropertyValue( "overflow-y" );
				if ( overflow === "scroll" || overflow === "auto" ) {
					break;
				}
			}
			// fallback: use the main content element or the document body
			if ( parent === documentElement ) {
				parent = documentElement.querySelector( "main.content" ) || document.body;
			}

			var $parent   = $( parent );
			var threshold = get( this, "scrollThreshold" );
			var target    = get( this, "targetObject" );
			var listener  = this.infiniteScroll.bind( this, parent, threshold, target );

			set( this, "$parent", $parent );
			set( this, "scrollListener", listener );

			$parent.on( "scroll", listener );
			$window.on( "resize", listener );
		},


		willDestroyElement: function() {
			this._super.apply( this, arguments );

			var $parent = get( this, "$parent" );
			var scrollListener = get( this, "scrollListener" );
			$parent.off( "scroll", scrollListener );
			$window.off( "resize", scrollListener );
			set( this, "$parent", null );
			set( this, "scrollListener", null );
		},


		infiniteScroll: function( elem, percentage, target ) {
			var threshold = percentage * elem.clientHeight;
			var remaining = elem.scrollHeight - elem.clientHeight - elem.scrollTop;
			if ( remaining <= threshold ) {
				target.send( "willFetchContent" );
			}
		}
	});

});
