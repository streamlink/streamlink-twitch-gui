define([
	"Ember",
	"text!templates/components/infinitescroll.html.hbs"
], function( Ember, layout ) {

	var get = Ember.get;
	var set = Ember.set;
	var alias = Ember.computed.alias;
	var or = Ember.computed.or;

	var $window = Ember.$( window );


	return Ember.Component.extend({
		layout: Ember.HTMLBars.compile( layout ),
		tagName: "button",
		classNameBindings: [ ":btn", ":btn-with-icon", ":infinitescroll", "hasFetchedAll:hidden" ],
		attributeBindings: [ "type", "disabled" ],

		scrollThreshold: 2 / 3,
		scrollListener : null,

		type: "button",
		disabled: or( "isFetching", "hasFetchedAll" ),
		error: alias( "targetObject.fetchError" ),

		isFetching: alias( "targetObject.isFetching" ),
		hasFetchedAll: alias( "targetObject.hasFetchedAll" ),

		click: function() {
			var targetObject = get( this, "targetObject" );
			targetObject.send( "willFetchContent", true );
		},


		didInsertElement: function() {
			this._super();

			var $elem     = this.$();
			var threshold = get( this, "scrollThreshold" );
			var target    = get( this, "targetObject" );
			var listener  = this.infiniteScroll.bind( this, $elem[ 0 ], threshold, target );

			set( this, "scrollListener", listener );

			$elem.parent().on( "scroll", listener );
			$window.on( "resize", listener );
		},

		willDestroyElement: function() {
			this._super();

			var scrollListener = get( this, "scrollListener" );
			var $elem = this.$();
			$elem.parent().off( "scroll", scrollListener );
			$window.off( "resize", scrollListener );

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
