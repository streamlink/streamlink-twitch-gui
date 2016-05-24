module.exports = {
	flags: {
		options: {
			plugins: [
				{ removeUselessStrokeAndFill: false }
			]
		},

		expand: true,
		dest  : "build/tmp/<%= svgmin.flags.flagsdir %>",
		cwd   : "src/<%= svgmin.flags.flagsdir %>",
		src   : "{<%= svgmin.flags.getFlags( grunt.config('langs') ) %>}.svg",

		"flagsdir": "vendor/flag-icon-css/flags/4x3/",
		"getFlags": function( langs ) {
			// Include all defined languages, even the disabled ones!!!
			// The disabled ones may not be selected by the user,
			// but are required by flags for localized language codes... (es-mx, pt-br, etc.)
			// Also, the "en" flag is a combination of "gb" and "us".
			return Object.keys( langs )
				.map(function( lang ) {
					return langs[ lang ][ "flag" ];
				})
				.join( "," );
		}
	}
};
