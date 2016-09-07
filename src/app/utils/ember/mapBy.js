function mapBy( key ) {
	return function( array ) {
		return array.mapBy( key );
	};
}


export default mapBy;
