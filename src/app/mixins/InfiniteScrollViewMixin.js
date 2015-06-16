define( [ "Ember" ], function( Ember ) {

	var $window = Ember.$( window );

	return Ember.Mixin.create({
		// fetch when near the bottom by 66.67% of the element's height
		scrollThreshold: 2 / 3,
		scrollListener: null,

		didInsertElement: function() {
			this._super();

			var	$elem		= this.$(),
				threshold	= this.get( "scrollThreshold" ),
				target		= this.get( "controller.target" ),
				listener	= this.infiniteScroll.bind( this, $elem[0], threshold, target );

			this.set( "scrollListener", listener );

			$elem.on( "scroll", listener );
			$window.on( "resize", listener );
		},

		willDestroyElement: function() {
			this._super();

			this.$().off( "scroll", this.get( "scrollListener" ) );
			$window.off( "resize", this.get( "scrollListener" ) );

			this.set( "scrollListener", null );
		},

		infiniteScroll: function( elem, percentage, target ) {
			var	threshold	= percentage * elem.clientHeight,
				remaining	= elem.scrollHeight - elem.clientHeight - elem.scrollTop;
			if ( remaining <= threshold ) {
				target.send( "willFetchContent" );
			}
		}
	});

});
