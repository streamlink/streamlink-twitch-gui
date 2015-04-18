module.exports = function( grunt ) {
	"use strict";

	var pack = require( "../common/package" );

	grunt.task.registerTask(
		"package:chocolatey",
		"Package for chocolatey",
		function(){
			var version = grunt.file.readJSON("package.json").version;
			var releaseNotes = pack.getReleaseNotes(version);

			grunt.config.set("releaseNotes", releaseNotes);

			grunt.task.run(["clean:package_chocolatey", "template:chocolatey", "shell:chocolatey"]);
		}
	);

};
