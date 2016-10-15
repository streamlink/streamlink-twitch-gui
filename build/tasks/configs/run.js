module.exports = {
	options: Object.assign( {}, require( "./nwjs" ).options, {
		argv: "--remote-debugging-port=8888"
	}),

	dev: {
		src: "<%= dir.tmp_dev %>/**"
	},

	prod: {
		src: "<%= dir.tmp_prod %>/**"
	}
};
