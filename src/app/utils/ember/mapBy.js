define(function() {

	return function mapBy( key ) {
		return function( array ) {
			return array.mapBy( key );
		};
	};

});
