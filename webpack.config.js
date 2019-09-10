var pkg = require( "./package.json" );
var _ = require( "lodash" );
var webpack = require( "webpack" );
var path = require( "path" );
const cleanWebpackPlugin = require( "clean-webpack-plugin" );
const TerserPlugin = require('terser-webpack-plugin');

var banner = [
	" * <%= pkg.name %> - <%= pkg.description %>",
	" * Author: <%= pkg.author %>",
	" * Version: v<%= pkg.version %>",
	" * Url: <%= pkg.homepage %>",
	" * License(s): <%= pkg.license %>"
].join( "\n" );
var header = _.template( banner )( { pkg: pkg } );

let source = path.join( __dirname, "src", "lux.js" );

module.exports = {
	mode: "production",
	entry: {
		"lux": source,
		"lux.min": source
	},
	output: {
		path: path.join( __dirname, "lib" ),
		publicPath: "./js/",
		library: "lux",
		libraryTarget: "umd",
		filename: "[name].js"
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
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin( {
				include: /\.min\.js$/,
				extractComments: false
			} )
		]
	},
	module: {
		rules: [
			{
				test: /\.js?$/,
				exclude: /(node_modules|bower_components)/,
				loader: "babel-loader",
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
		new cleanWebpackPlugin( [ "lib" ], {
			root: __dirname,
			verbose: true,
			dry: false
		} ),
		new webpack.BannerPlugin( header )
	]
};
