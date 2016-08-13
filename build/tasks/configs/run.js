module.exports = {
	options: Object.assign( {}, require( "./nwjs" ).options, {
		argv: "--remote-debugging-port=8888"
	}),

	build: {
		src: "build/tmp/**"
	}
};
