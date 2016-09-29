var pkg = require( "./package.json" );
var _ = require( "lodash" );
var webpack = require( "webpack" );
var path = require( "path" );
const CleanWebpackPlugin = require( "clean-webpack-plugin" );

var banner = [
	" * <%= pkg.name %> - <%= pkg.description %>",
	" * Author: <%= pkg.author %>",
	" * Version: v<%= pkg.version %>",
	" * Url: <%= pkg.homepage %>",
	" * License(s): <%= pkg.license %>"
].join( "\n" );
var header = _.template( banner )( { pkg: pkg } );

module.exports = {
	entry: path.join( __dirname, "src", "lux.js" ),
	output: {
		path: path.join( __dirname, "lib" ),
		publicPath: "./js/",
		library: "lux",
		libraryTarget: "umd",
		filename: "lux.min.js"
	},
	devtool: "source-map",
	externals: [
		{
			postal: true,
			machina: true,
			lodash: {
				root: "_",
				commonjs: "lodash",
				commonjs2: "lodash",
				amd: "lodash"
			},
			react: {
				root: "React",
				commonjs: "react",
				commonjs2: "react",
				amd: "react"
			}
		}
	],
	module: {
		loaders: [
			{
				test: /\.js?$/,
				exclude: /(node_modules|bower_components)/,
				loader: "babel",
				query: {
					compact: false,
					presets: [
						"es2015-without-strict",
						"stage-0"
					],
					plugins: [ "add-module-exports" ]
				}
			}
					]
	},
	plugins: [
		new CleanWebpackPlugin( [ "lib" ], {
			root: __dirname,
			verbose: true,
			dry: false
		} ),
		new webpack.optimize.UglifyJsPlugin(),
		new webpack.BannerPlugin( header )
	]
};
