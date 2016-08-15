module.exports = {
	options: Object.assign( {}, require( "./nwjs" ).options, {
		argv: "--remote-debugging-port=8888"
	}),

	dev: {
		src: "build/tmp/dev/**"
	},

	prod: {
		src: "build/tmp/prod/**"
	}
};
