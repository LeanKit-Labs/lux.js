var gulp = require( "gulp" );
var gutil = require( "gulp-util" );
var rename = require( "gulp-rename" );
var uglify = require( "gulp-uglify" );
var _ = require( "lodash" );
var eslint = require( "gulp-eslint" );
var jscs = require( "gulp-jscs" );
var gulpChanged = require( "gulp-changed" );
var webpack = require( "gulp-webpack" );
var path = require( "path" );
var karma = require( "karma" );
var mocha = require( "gulp-spawn-mocha" );
var sourcemaps = require( "gulp-sourcemaps" );

gulp.task( "default", [ "build" ] );

gulp.task( "build", [ "format" ], function() {
	return gulp.src( "src/lux.js" )
		.pipe( webpack( require( "./webpack.config.js" ) ) )
		.pipe( gulp.dest( "lib/" ) )
		.pipe( sourcemaps.init( { loadMaps: true } ) )
		.pipe( uglify( {
			preserveComments: "license",
			compress: {
				/*eslint-disable */
				negate_iife: false
				/*eslint-enable */
			}
		} ) )
		.pipe( rename( "lux.min.js" ) )
		.pipe( sourcemaps.write( "./" ) )
		.pipe( gulp.dest( "lib/" ) );
} );

function runTests( options, done ) {
	var server = new karma.Server( _.extend( {
		configFile: path.join( __dirname, "/karma.conf.js" ),
		singleRun: true

		// no-op keeps karma from process.exit'ing gulp
	}, options ), done || function() {} );

	server.start();
}

gulp.task( "test", [ "build" ], function( done ) {
	runTests( { reporters: [ "spec" ] }, function( err ) {
		if ( err !== 0 ) {
			// Exit with the error code
			process.exit( err );
		} else {
			done( null );
		}
	} );
} );

gulp.task( "coverage", [ "build" ], function( done ) {
	runTests( {}, function( err ) {
		if ( err !== 0 ) {
			// Exit with the error code
			process.exit( err );
		} else {
			done( null );
		}
	} );
} );

gulp.task( "mocha", [ "build" ], function() {
	return gulp.src( [ "spec/**/*.spec.js" ], { read: false } )
		.pipe( mocha( {
			require: [ "spec/helpers/node-setup.js" ],
			reporter: "spec",
			colors: true,
			inlineDiffs: true,
			debug: false
		} ) )
		.on( "error", console.warn.bind( console ) );
} );

gulp.task( "lint", function() {
	return gulp.src( [ "src/**/*.js", "spec/**/*.spec.js" ] )
	.pipe( eslint() )
	.pipe( eslint.format() )
	.pipe( eslint.failOnError() );
} );

gulp.task( "format", [ "lint" ], function() {
	return gulp.src( [ "**/*.js", "!node_modules/**" ] )
		.pipe( jscs( {
			configPath: ".jscsrc",
			fix: true
		} ) )
		.on( "error", function( error ) {
			gutil.log( gutil.colors.red( error.message ) );
			this.end();
		} )
		.pipe( gulpChanged( ".", { hasChanged: gulpChanged.compareSha1Digest } ) )
		.pipe( gulp.dest( "." ) );
} );

gulp.task( "watch", function() {
	gulp.watch( "src/**/*", [ "default" ] );
	gulp.watch( "{lib,spec}/**/*", [ "mocha" ] );
} );
