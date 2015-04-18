define(function() {

	return {
		uncountable: [
			"settings",
			"channelsettings",
			"githubreleases"
		].reduce(function( obj, value ) {
			obj[ value ] = true;
			return obj;
		}, {} )
	};

});
