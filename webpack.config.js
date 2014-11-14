/* global __dirname */
var webpack = require( "webpack" ); //jshint ignore:line
var sml = require("source-map-loader"); //jshint ignore:line
var path = require("path");

module.exports = {
	module: {
		preLoaders: [
			{
				test: /\.js$/,
				loader: "source-map-loader"
			}
		]
	},
	resolve: {
		alias: {
			"when.parallel": "when/parallel",
			"when.pipeline": "when/pipeline",
			react          : "react/dist/react-with-addons.js",
			traceur        : "traceur/bin/traceur-runtime",
			lux            : path.join( __dirname, "./lib/lux.js"),
		}
	}
};
