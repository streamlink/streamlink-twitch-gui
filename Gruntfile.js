module.exports = function( grunt ) {
	"use strict";

	var pkg = grunt.file.readJSON( "package.json" );

	grunt.initConfig({
		pkg				: pkg,

		less			: {
			all				: {
				options			: {
					compress			: true,
					// cleancss disables sourcemaps in current less version (1.5.1)
					cleancss			: false,
					relativeUrls		: true,
					strictMath			: true,
					strictUnits			: true,
					sourceMap			: !!pkg.config.sourceMaps,
					sourceMapFilename	: pkg.config.sourceMaps
						? "app.css.map"
						: null,
					sourceMapBasepath	: pkg.config.sourceMaps
						? __dirname + "/src"
						: null
				},
				src				: "src/styles/app.less",
				dest			: "build/tmp/styles/app.css"
			}
		},

		jshint			: {
			options			: {
				jshintrc		: "src/.jshintrc"
			},
			src				: [ "src/**/*.js", "!src/vendor/**" ]
		},

		requirejs		: {
			all				: {
				options			: {
					baseUrl					: "src/app",
					mainConfigFile			: "src/app/config.js",

					name					: "",
					out						: "build/tmp/app/main.js",

					include					: [ "main" ],
					insertRequire			: [ "main" ],

					findNestedDependencies	: true,
					generateSourceMaps		: !!pkg.config.sourceMaps,
					optimize				: "none",

					/*
					 * Create module definitions for all non-AMD modules!
					 */
					skipModuleInsertion		: false,
					/*
					 * Handlebars doesn't register itself to the global namespace properly... :(
					 * var Handlebars=(function(){...})()
					 * So we can't use a shim config which reads from the global namespace
					 * this.Handlebars === undefined
					 * So Handlebars and Ember will only work if we don't wrap all the code :(((
					 */
					wrap					: false,

					skipSemiColonInsertion	: true,
					useStrict				: true,
					preserveLicenseComments	: true
				}
			}
		},

		uglify			: {
			all				: {
				options			: {
					compress			: {
						global_defs			: {}
					},
					mangle				: true,
					beautify			: false,
					preserveComments	: "some",

					sourceMap			: pkg.config.sourceMaps
						? "build/tmp/app/main.js.map"
						: false,
					sourceMappingURL	: pkg.config.sourceMaps
						? "main.js.map"
						: null,
					sourceMapIn			: pkg.config.sourceMaps
						? "build/tmp/app/main.js.map"
						: null,

					report				: "min",
					banner				: [
						"/*!",
						" * <%= pkg.name %>",
						" * @version v<%= pkg.version %>",
						" * @date <%= grunt.template.today('yyyy-mm-dd') %>",
						" * @copyright <%= pkg.author %>",
						" */"
					].join( "\n" )
				},
				src				: "build/tmp/app/main.js",
				// overwrite input file
				dest			: "build/tmp/app/main.js"
			}
		},

		clean			: {
			build			: [
				"build/releases",
				"build/tmp"
			]
		},

		copy			: {
			app				: {
				expand			: true,
				cwd				: "src",
				src				: [
					"package.json",
					"index.html",
					"vendor/requirejs/require.js",
					"**/*.woff",
					"img/**",
					"templates/**"
				],
				dest			: "build/tmp"
			}
		},

		nodewebkit		: {
			options			: {
				build_dir		: "build",
				version			: "0.8.1",
				keep_nw			: true,
				win				: false,
				mac				: false,
				linux32			: false,
				linux64			: false
			},
			win				: {
				options			: { win: true },
				src				: "build/tmp/**"
			},
			mac				: {
				options			: { mac: true },
				src				: "build/tmp/**"
			},
			linux32				: {
				options			: { linux32: true },
				src				: "build/tmp/**"
			},
			linux64				: {
				options			: { linux64: true },
				src				: "build/tmp/**"
			}
		},

		compress		: {
			options			: {
				mode			: "zip",
				level			: 9
			},
			win				: {
				options			: { archive: "dist/win.zip" },
				files			: [
					{
						expand			: true,
						flatten			: true,
						cwd				: "build/releases/livestreamer-twitch-gui",
						src				: [ "win/**" ],
						dest			: "livestreamer-twitch-gui"
					}
				]
			}
		},

		compile: {
			all: {}
		}
	});


	grunt.task.registerMultiTask(
		"compile",
		"Compile the built project with node-webkit for your platform",
		function() {
			switch ( process.platform ) {
				case "win32":
					grunt.task.run( [ "nodewebkit:win", "compress:win" ] );
					return;
				case "mac":
					grunt.task.run( [ "nodewebkit:mac", "compress:mac" ] );
					return;
				case "linux":
					switch ( process.arch ) {
						case "x86":
							grunt.task.run( [ "nodewebkit:linux32", "compress:linux32" ] );
							return;
						case "x64":
							grunt.task.run( [ "nodewebkit:linux64", "compress:linux64" ] );
							return;
					}
			}
			grunt.fail.fatal( "Could not compile for your platform" );
		}
	);


	grunt.loadNpmTasks( "grunt-contrib-less" );
	grunt.loadNpmTasks( "grunt-contrib-jshint" );
	grunt.loadNpmTasks( "grunt-contrib-requirejs" );
	grunt.loadNpmTasks( "grunt-contrib-uglify" );
	grunt.loadNpmTasks( "grunt-contrib-clean" );
	grunt.loadNpmTasks( "grunt-contrib-copy" );
	grunt.loadNpmTasks( "grunt-contrib-compress" );
	grunt.loadNpmTasks( "grunt-node-webkit-builder" );

	grunt.registerTask( "default", [ "" ] );
	grunt.registerTask( "build", [ "clean", "copy", "less", "requirejs", "uglify", "compile" ] );

};
