module.exports = function( grunt ) {
	"use strict";

	var pkg = grunt.file.readJSON( "package.json" );

	grunt.initConfig({
		pkg				: pkg,

		less			: {
			options			: {
				compress			: false,
				// cleancss still has no soucemap support
				// https://github.com/gruntjs/grunt-contrib-less/issues/165
				cleancss			: false,
				relativeUrls		: true,
				strictMath			: true,
				strictUnits			: true,
				sourceMap			: true,
				sourceMapBasepath	: "src",
				sourceMapRootpath	: "../",
				sourceMapURL		: "app.css.map"
			},
			source			: {
				options			: {
					sourceMapFilename	: "src/styles/app.css.map"
				},
				src				: "src/styles/app.less",
				dest			: "src/styles/app.css"
			},
			dev				: {
				options			: {
					sourceMapFilename	: "build/tmp/styles/app.css.map",
					outputSourceFiles	: true
				},
				src				: "src/styles/app.less",
				dest			: "build/tmp/styles/app.css"
			},
			release			: {
				options			: {
					compress			: true,
					sourceMap			: false
				},
				src				: "src/styles/app.less",
				dest			: "build/tmp/styles/app.css"
			}
		},

		jshint			: {
			app				: {
				options			: {
					jshintrc		: "src/.jshintrc"
				},
				src				: [ "src/**/*.js", "!src/vendor/**", "!src/test/**" ]
			},
			test			: {
				options			: {
					jshintrc		: "src/test/.jshintrc"
				},
				src				: [ "src/test/**/*.js" ]
			}
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
			build			: {
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
			},
			linux32start	: {
				options			: { mode: 493 }, // 0755 (js strict mode)
				src				: "build/script/start.sh",
				dest			: "build/releases/<%= pkg.name %>/linux32/<%= pkg.name %>/start.sh"
			},
			linux64start	: {
				options			: { mode: 493 }, // 0755 (js strict mode)
				src				: "build/script/start.sh",
				dest			: "build/releases/<%= pkg.name %>/linux64/<%= pkg.name %>/start.sh"
			}
		},

		watch			: {
			lesssource		: {
				files			: [ "src/**/*.less" ],
				tasks			: [ "less:source" ]
			},
			less			: {
				files			: [ "src/**/*.less" ],
				tasks			: [ "less:dev" ]
			},
			js				: {
				files			: [ "src/**/*.js" ],
				tasks			: [ "requirejs:dev" ]
			}
		},

		concurrent		: {
			options			: {
				logConcurrentOutput	: true
			},
			dev_watchers	: [ "watch:less", "watch:js" ]
		},

		qunit			: {
			all				: {
				options			: {
					urls			: [
						"http://localhost:8000/test/tests.html"
					]
				}
			}
		},

		connect			: {
			test			: {
				options			: {
					port			: 8000,
					base			: "./src"
				}
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
			linux32			: {
				options			: { linux32: true },
				src				: "build/tmp/**"
			},
			linux64			: {
				options			: { linux64: true },
				src				: "build/tmp/**"
			}
		},

		compress		: {
			options			: {
				mode			: "tgz",
				level			: 9
			},
			win				: {
				options			: { mode: "zip", archive: "dist/<%= pkg.name %>-v<%= pkg.version %>-win.zip" },
				expand			: true,
				cwd				: "build/releases/<%= pkg.name %>/win",
				src				: [ "**" ],
				dest			: ""
			},
			mac				: {
				options			: { archive: "dist/<%= pkg.name %>-v<%= pkg.version %>-mac.tar.gz" },
				expand			: true,
				cwd				: "build/releases/<%= pkg.name %>/mac",
				src				: [ "**" ],
				dest			: ""
			},
			linux32			: {
				options			: { archive: "dist/<%= pkg.name %>-v<%= pkg.version %>-linux32.tar.gz" },
				expand			: true,
				cwd				: "build/releases/<%= pkg.name %>/linux32",
				src				: [ "**" ],
				dest			: ""
			},
			linux64			: {
				options			: { archive: "dist/<%= pkg.name %>-v<%= pkg.version %>-linux64.tar.gz" },
				expand			: true,
				cwd				: "build/releases/<%= pkg.name %>/linux64",
				src				: [ "**" ],
				dest			: ""
			}
		}
	});


	grunt.loadNpmTasks( "grunt-concurrent" );
	grunt.loadNpmTasks( "grunt-contrib-clean" );
	grunt.loadNpmTasks( "grunt-contrib-compress" );
	grunt.loadNpmTasks( "grunt-contrib-connect" );
	grunt.loadNpmTasks( "grunt-contrib-copy" );
	grunt.loadNpmTasks( "grunt-contrib-jshint" );
	grunt.loadNpmTasks( "grunt-contrib-less" );
	grunt.loadNpmTasks( "grunt-contrib-qunit" );
	grunt.loadNpmTasks( "grunt-contrib-requirejs" );
	grunt.loadNpmTasks( "grunt-contrib-uglify" );
	grunt.loadNpmTasks( "grunt-contrib-watch" );
	grunt.loadNpmTasks( "grunt-node-webkit-builder" );

	grunt.loadTasks( "build/tasks" );

	grunt.registerTask( "default", [ "" ] );
	grunt.registerTask( "test", [ "jshint:test", "connect:test", "qunit" ] );
	grunt.registerTask( "build", [ "jshint:app", "clean:dev", "copy:build", "metadata", "less:dev", "requirejs:dev" ] );
	grunt.registerTask( "buildrelease", [ "jshint:app", "test", "clean:release", "copy:build", "metadata", "less:release", "requirejs:release", "uglify" ] );
	grunt.registerTask( "dev", [ "build", "concurrent:dev_watchers" ] );

};
