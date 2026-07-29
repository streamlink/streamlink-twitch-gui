const { arch } = require( "process" );
const { resolve: r, posix: { join: j } } = require( "path" );
const { pRoot, pDependencies } = require( "../paths" );

const MiniCssExtractPlugin = require( "mini-css-extract-plugin" );
const CssMinimizerWebpackPlugin = require( "css-minimizer-webpack-plugin" );
const CopyWebpackPlugin = require( "copy-webpack-plugin" );


/**
 * Stylesheets and assets
 */
module.exports = {
	common( config, grunt, target ) {
		// vendor stylesheets: don't parse anything
		config.module.rules.push({
			test: /\.css$/,
			use: [
				MiniCssExtractPlugin.loader,
				{
					loader: "css-loader",
					options: {
						sourceMap: true,
						url: false,
						import: false
					}
				}
			]
		});

		// application stylesheets
		config.module.rules.push({
			test: /\.less$/,
			include: pRoot,
			use: [
				MiniCssExtractPlugin.loader,
				{
					loader: "css-loader",
					options: {
						sourceMap: true,
						url: true,
						import: false
					}
				},
				{
					loader: "less-loader",
					options: {
						lessOptions: {
							sourceMap: true,
							strictMath: true,
							strictUnits: true,
							relativeUrls: true,
							noIeCompat: true
						}
					}
				}
			]
		});

		// assets
		config.module.rules.push({
			test: /\.woff2$/,
			type: "asset/resource",
			generator: {
				filename: j( "assets", "fonts", "[name][ext]" )
			}
		});
		config.module.rules.push({
			test: /\.svg$/,
			include: r( pDependencies, "flag-icons" ),
			type: "asset/resource",
			generator: {
				filename: j( "assets", "flags", "[name][ext]" )
			}
		});
		config.module.rules.push({
			test: /\.(jpe?|pn|sv)g$/,
			exclude: r( pDependencies, "flag-icons" ),
			type: "asset/resource",
			generator: {
				filename: "[path][name][ext]"
			}
		});

		// extract CSS files
		config.plugins.push(
			new MiniCssExtractPlugin({
				filename: "[name].css"
			})
		);

		// snoretoast
		if ( target === "prod" || target === "dev" && arch === "win32" ) {
			config.plugins.push(
				new CopyWebpackPlugin({
					patterns: [
						{
							from: r( pDependencies, "snoretoast", "bin", "32", "snoretoast.exe" ),
							to: j( "bin", "win32", "snoretoast.exe" )
						},
						{
							from: r( pDependencies, "snoretoast", "COPYING.LGPL-3" ),
							to: j( "bin", "win32", "snoretoast-LICENSE.txt" )
						},
						{
							from: r( pDependencies, "snoretoast", "bin", "64", "snoretoast.exe" ),
							to: j( "bin", "win64", "snoretoast.exe" )
						},
						{
							from: r( pDependencies, "snoretoast", "COPYING.LGPL-3" ),
							to: j( "bin", "win64", "snoretoast-LICENSE.txt" )
						}
					]
				})
			);
		}
	},

	prod( config ) {
		// optimize SVGs in production builds
		config.module.rules.push({
			test: /\.svg$/,
			loader: "svgo-loader",
			options: {
				plugins: [
					{
						name: "preset-default",
						overrides: {
							convertPathData: {
								applyTransforms: false
							},
							removeUselessStrokeAndFill: false
						}
					}
				]
			}
		});

		// minifiy and optimize production stylesheets
		config.optimization.minimizer.push(
			new CssMinimizerWebpackPlugin()
		);
	}
};
