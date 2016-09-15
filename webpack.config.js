var pkg = require( "./package.json" );
var _ = require( "lodash" );
var webpack = require( "webpack" );
var banner = [
	" * <%= pkg.name %> - <%= pkg.description %>",
	" * Author: <%= pkg.author %>",
	" * Version: v<%= pkg.version %>",
	" * Url: <%= pkg.homepage %>",
	" * License(s): <%= pkg.license %>"
].join( "\n" );
var header = _.template( banner )( { pkg: pkg } );

module.exports = {
	output: {
		library: "lux",
		libraryTarget: "umd",
		filename: "lux.js"
	},
	devtool: "#inline-source-map",
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
					auxiliaryCommentBefore: "istanbul ignore next",
					compact: false,
					blacklist: [ "strict" ],
					experimental: true
				}
			}
		]
	},
	plugins: [
		new webpack.BannerPlugin( header )
	]
};
