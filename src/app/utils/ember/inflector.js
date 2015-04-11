define(function() {

	return {
		uncountable: [
			"settings",
			"githubreleases"
		].reduce(function( obj, value ) {
			obj[ value ] = true;
			return obj;
		}, {} )
	};

});
