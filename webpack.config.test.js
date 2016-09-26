/*eslint-disable */
var webpack = require( "webpack" );
var sml = require( "source-map-loader" );
/*eslint-enable */
var path = require( "path" );

module.exports = {
	module: {
		preLoaders: [
			{
				test: /\.js$/,
				loader: "source-map-loader"
			}
		],
		loaders: [
			{ test: /sinon.*\.js/, loader: "imports?define=>false" },
			{
				test: /\.spec\.js$/,
				exclude: /node_modules/,
				loader: "babel-loader",
				query: {
					auxiliaryCommentBefore: "istanbul ignore next",
					compact: false,
					presets: [
						"es2015-without-strict",
						"stage-0"
					],
					plugins: [ "add-module-exports" ]
				}
			}
		],
		postLoaders: [ {
			test: /\.js$/,
			exclude: /(spec|node_modules)\//,
			loader: "istanbul-instrumenter"
		} ]
	},
	resolve: {
		alias: {
			"when.parallel": "when/parallel",
			"when.pipeline": "when/pipeline",
			lux: path.join( __dirname, "./lib/lux.js" )
		}
	}
};
