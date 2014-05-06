module.exports = function( grunt ) {
	"use strict";

	var pkg = grunt.file.readJSON( "package.json" );

	grunt.initConfig({
		pkg				: pkg,

		less			: {
			options			: {
				compress			: true,
				// cleancss still has no soucemap support
				// https://github.com/gruntjs/grunt-contrib-less/issues/165
				cleancss			: false,
				relativeUrls		: true,
				strictMath			: true,
				strictUnits			: true
			},
			dev				: {
				options			: {
					sourceMap			: true,
					sourceMapFilename	: "build/tmp/styles/app.css.map",
					sourceMapURL		: "app.css.map",
					sourceMapBasepath	: __dirname + "/src",
					sourceMapRootpath	: "../../../",
					outputSourceFiles	: true
				},
				src				: "src/styles/app.less",
				dest			: "build/tmp/styles/app.css"
			},
			release			: {
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
			options			: {
				baseUrl					: "src/app",
				mainConfigFile			: "src/app/config.js",

				name					: "",
				out						: "build/tmp/app/main.js",

				include					: [ "main" ],

				findNestedDependencies	: true,
				generateSourceMaps		: false,
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
			},
			dev				: {
				options			: {
					generateSourceMaps	: true
				}
			},
			release			: {}
		},

		uglify			: {
			options			: {
				compress			: {
					global_defs			: {
						DEBUG				: false
					}
				},
				mangle				: true,
				beautify			: false,
				preserveComments	: "some",

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
			release			: {
				// overwrite input file
				src				: "build/tmp/app/main.js",
				dest			: "build/tmp/app/main.js"
			}
		},

		clean			: {
			options			: { force: true },
			dev				: [ "build/tmp/**", "!build/tmp" ],
			release			: [ "build/{tmp,releases}/**", "!build/{tmp,releases}" ]
		},

		metadata		: {
			all				: {
				dependencies	: [
					"bower.json",
					"package.json"
				],
				contributors	: {
					minCommits		: 5
				},
				dest			: "build/tmp/metadata.json"
			}
		},

		copy			: {
			all				: {
				expand			: true,
				cwd				: "src",
				src				: [
					"package.json",
					"index.html",
					"vendor/requirejs/require.js",
					"fonts/*.woff",
					"vendor/font-awesome/fonts/*.woff",
					"img/**"
				],
				dest			: "build/tmp"
			}
		},

		watch			: {
			less			: {
				files			: [ "src/**/*.less" ],
				tasks			: [ "less:dev" ]
			},
			js				: {
				files			: [ "src/**/*.js" ],
				tasks			: [ "requirejs:dev" ]
			}
		},

		nodewebkit		: {
			options			: {
				build_dir		: "build",
				version			: "<%= pkg.config['node-webkit-version'] %>",
				keep_nw			: false,
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
				options			: { archive: "dist/<%= pkg.name %>-v<%= pkg.version %>-win.zip" },
				files			: [ {
					expand			: true,
					flatten			: true,
					cwd				: "build/releases/<%= pkg.name %>",
					src				: [ "win/**" ],
					dest			: "<%= pkg.name %>"
				} ]
			},
			mac				: {
				options			: { archive: "dist/<%= pkg.name %>-v<%= pkg.version %>-mac.zip" },
				files			: [ {
					expand			: true,
					flatten			: true,
					cwd				: "build/releases/<%= pkg.name %>",
					src				: [ "mac/**" ],
					dest			: "<%= pkg.name %>"
				} ]
			},
			linux32			: {
				options			: { archive: "dist/<%= pkg.name %>-v<%= pkg.version %>-linux32.zip" },
				files			: [ {
					expand			: true,
					flatten			: true,
					cwd				: "build/releases/<%= pkg.name %>",
					src				: [ "linux32/**" ],
					dest			: "<%= pkg.name %>"
				} ]
			},
			linux64			: {
				options			: { archive: "dist/<%= pkg.name %>-v<%= pkg.version %>-linux64.zip" },
				files			: [ {
					expand			: true,
					flatten			: true,
					cwd				: "build/releases/<%= pkg.name %>",
					src				: [ "linux64/**" ],
					dest			: "<%= pkg.name %>"
				} ]
			}
		},

		compile: {
			all: {}
		}
	});


	grunt.loadNpmTasks( "grunt-contrib-clean" );
	grunt.loadNpmTasks( "grunt-contrib-compress" );
	grunt.loadNpmTasks( "grunt-contrib-copy" );
	grunt.loadNpmTasks( "grunt-contrib-jshint" );
	grunt.loadNpmTasks( "grunt-contrib-less" );
	grunt.loadNpmTasks( "grunt-contrib-requirejs" );
	grunt.loadNpmTasks( "grunt-contrib-uglify" );
	grunt.loadNpmTasks( "grunt-contrib-watch" );
	grunt.loadNpmTasks( "grunt-node-webkit-builder" );

	grunt.loadTasks( "build/tasks" );

	grunt.registerTask( "default", [ "" ] );
	grunt.registerTask( "build", [ "clean:dev", "copy", "metadata", "less:dev", "requirejs:dev" ] );
	grunt.registerTask( "dev", [ "build", "watch" ] );
	grunt.registerTask( "release", [ "clean:release", "copy", "metadata", "less:release", "requirejs:release", "uglify", "compile" ] );

};
