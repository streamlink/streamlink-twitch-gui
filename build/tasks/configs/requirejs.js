module.exports = {
	options			: {
		baseUrl					: "src/app",
		mainConfigFile			: "src/app/config.js",

		name					: "",
		out						: "build/tmp/app/main.js",

		include					: [ "main" ],

		findNestedDependencies	: true,
		generateSourceMaps		: false,
		optimize				: "none",

		skipModuleInsertion		: false,
		wrap					: false,

		skipSemiColonInsertion	: true,
		useStrict				: true,
		preserveLicenseComments	: true,


		onBuildRead: function ( moduleName, path, contents ) {
			/*
			 * https://github.com/emberjs/ember.js/issues/4994
			 * https://github.com/emberjs/data/issues/2196
			 * https://github.com/dbashford/ember-canary-plus-almond/commit/c0a494d5
			 *
			 * Ember v1.7.0 and ember-data v1.0.0-beta.9 both changed their internal
			 * module loader structure. Requirejs detects the internal define calls and
			 * misinterprets these as global calls. This causes a false name collision.
			 * The fix is to rename the internal modules to "ember-fix" and "ember-data-fix".
			 * The final ember and ember-data modules will be created like before, by using the
			 * shim exports and module insertion function of requirejs.
			 *
			 * UPDATE:
			 * The internal module loader of ember was fixed in the v1.8.0 release. Ember-data's
			 * module loader will also be fixed in the upcoming (beta) release - it is fixed in the
			 * current canary build.
			 * Their solution was reversing the function names, which is similar to this approach.
			 */
			[ /*"ember", */"ember-data" ].forEach(function( module ) {
				if ( moduleName === module ) {
					contents = contents.replace(
						new RegExp( "(define|requireModule)\\(([\"'])" + module + "\\2", "gm" ),
						function( _, fn, q ) {
							return fn + "(" + q + module + "-fix" + q;
						}
					);
				}
			});
			return contents;
		}
	},
	dev				: {
		options			: {
			generateSourceMaps	: true
		}
	},
	release			: {
		options			: {
			/*
			 * Do not use dev versions for release builds
			 *
			 * Defining two versions in the config file and mapping the names for a release build
			 * doesn't seem to work here. So we need to overwrite the paths in the grunt config :(
			 * https://gist.github.com/askesian/6e05daa443ca1955ea32
			 */
			paths			: {
				"ember"			: "../vendor/ember/ember.prod",
				"ember-data"	: "../vendor/ember-data/ember-data.prod"
			}
		}
	}
};
