const { resolve: r } = require( "path" );
const { pTest, pTestFixtures, pDependencies } = require( "../paths" );
const { buildBabelConfig } = require( "../utils" );

const webpack = require( "webpack" );


/**
 * Configurations related to creating test and coverage builds
 */
module.exports = {
	_tests( config ) {
		// the inject-loader used by some tests requires es2015 modules to be transpiled
		config.module.rules.unshift({
			test: /\.js$/,
			exclude: pDependencies,
			loader: "babel-loader",
			options: buildBabelConfig({
				plugins: [
					"@babel/plugin-transform-modules-commonjs"
				]
			})
		});

		// ignore Windows binary dependencies in tests
		config.plugins.push( new webpack.IgnorePlugin( /\.exe$/ ) );
	},

	_aliases( config ) {
		Object.assign( config.resolve.alias, {
			"tests": r( pTest, "tests" ),
			"fixtures": pTestFixtures,
			"qunit$": r( pTest, "web_modules", "qunit" ),
			"require": r( pTest, "web_modules", "require" )
		});
	},

	test( config ) {
		this._tests( config );
		this._aliases( config );
	},

	testdev( config ) {
		this._tests( config );
		this._aliases( config );
	},

	coverage( config ) {
		this._aliases( config );

		config.module.rules.unshift({
			test: /\.js$/,
			exclude: pDependencies,
			loader: "babel-loader",
			options: buildBabelConfig({
				plugins: [
					// the inject-loader used by some tests requires es2015 modules to be transpiled
					"@babel/plugin-transform-modules-commonjs",
					// code instrumentation via babel-plugin-istanbul
					[ "babel-plugin-istanbul", {
						exclude: [
							"**/src/web_modules/**"
						]
					} ]
				]
			})
		});
	}
};
