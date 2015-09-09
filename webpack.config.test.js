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
			{ test: /\.spec\.js$/, exclude: /node_modules/, loader: "babel-loader" }
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
			react: "react/dist/react-with-addons.js",
			lux: path.join( __dirname, "./lib/lux.js" )
		}
	}
};
