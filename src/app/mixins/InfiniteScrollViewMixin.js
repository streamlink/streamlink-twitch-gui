define( [ "Ember" ], function( Ember ) {

	var get = Ember.get;
	var set = Ember.set;

	var $window = Ember.$( window );

	return Ember.Mixin.create({
		// fetch when near the bottom by 66.67% of the element's height
		scrollThreshold: 2 / 3,
		scrollListener : null,

		didInsertElement: function() {
			this._super();

			var $elem     = this.$();
			var threshold = get( this, "scrollThreshold" );
			var target    = get( this, "controller.target" );
			var listener  = this.infiniteScroll.bind( this, $elem[ 0 ], threshold, target );

			set( this, "scrollListener", listener );

			$elem.on( "scroll", listener );
			$window.on( "resize", listener );
		},

		willDestroyElement: function() {
			this._super();

			var scrollListener = get( this, "scrollListener" );
			this.$().off( "scroll",scrollListener );
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
