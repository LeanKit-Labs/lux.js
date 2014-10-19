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
			lodash         : "lodash/dist/lodash.js",
			when           : "when/when.js",
			"when.parallel": path.join( __dirname, "./node_modules/when/parallel.js"),
			"when.pipeline": path.join( __dirname, "./node_modules/when/pipeline.js"),
			react          : "react/dist/react-with-addons.js",
			machina        : "machina/lib/machina.js",
			conduitjs      : "conduitjs/lib/conduit.js",
			postal         : "postal/lib/postal.js",
			"postal.request-response" : "postal.request-response/lib/postal.request-response.js",
			traceur        : path.join( __dirname, "./node_modules/traceur/bin/traceur-runtime.js"),
			lux            : path.join( __dirname, "./lib/lux.js"),
		}
	}
};

console.log(path.join( __dirname, "./node_modules/traceur/bin/traceur-runtime.js"));
