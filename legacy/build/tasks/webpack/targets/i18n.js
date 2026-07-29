module.exports = {
	devtool: false,

	// this target doesn't output anything, but just in case, set the output path to the test dir
	output: {
		path: "<%= dir.tmp_test %>"
	}
};
