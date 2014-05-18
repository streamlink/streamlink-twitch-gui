define( [ "ember" ], function( Ember ) {

	return Ember.Mixin.create({
		scrollListener: null,

		didInsertElement: function() {
			this._super();

			var	$elem = this.$(),
				listener = this.infiniteScroll.bind( this,
					$elem[0],
					this.get( "controller.target" )
				);
			this.set( "scrollListener", listener );
			$elem.on( "scroll", listener );
		},

		willDestroyElement: function() {
			this._super();

			this.$().off( "scroll", this.get( "scrollListener" ) );
		},

		infiniteScroll: function( elem, target ) {
			if ( elem.scrollTop === elem.scrollHeight - elem.clientHeight ) {
				target.send( "willFetchContent" );
			}
		}
	});

});
