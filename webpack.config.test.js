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
				test: /\.js$/,
				exclude: /node_modules/,
				loader: "babel-loader",
				query: {
					compact: false,
					presets: [
						"es2015-without-strict",
						"stage-0"
					],
					plugins: [ "add-module-exports",
						[
							"babel-plugin-istanbul",
							{ exclude: [ "spec/**/*" ] }
						]
					]
				}
			}
		]
	},
	resolve: {
		alias: {
			"when.parallel": "when/parallel",
			"when.pipeline": "when/pipeline",
			lux: path.join( __dirname, "./src/lux.js" )
		}
	}
};
