const { resolve: r, posix: { join: j } } = require( "path" );
const { pRoot, pDependencies } = require( "../paths" );

const MiniCssExtractPlugin = require( "mini-css-extract-plugin" );
const CssMinimizerWebpackPlugin = require( "css-minimizer-webpack-plugin" );


/**
 * Stylesheets and assets
 */
module.exports = {
	common( config ) {
		// vendor stylesheets: don't parse anything
		config.module.rules.push({
			test: /\.css$/,
			use: [
				MiniCssExtractPlugin.loader,
				{
					loader: "css-loader",
					options: {
						sourceMap: false,
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
			loader: "file-loader",
			options: {
				name: j( "assets", "fonts", "[name].[ext]" )
			}
		});
		config.module.rules.push({
			test: /\.svg$/,
			include: r( pDependencies, "flag-icons" ),
			loader: "file-loader",
			options: {
				name: j( "assets", "flags", "[name].[ext]" )
			}
		});
		config.module.rules.push({
			test: /\.(jpe?|pn|sv)g$/,
			exclude: r( pDependencies, "flag-icons" ),
			loader: "file-loader",
			options: {
				name: "[path][name].[ext]",
				outputPath: url => j( "assets", url.replace( /^assets[\/\\]/, "" ) )
			}
		});

		// extract CSS files
		config.plugins.push(
			new MiniCssExtractPlugin({
				filename: "[name].css"
			})
		);
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
