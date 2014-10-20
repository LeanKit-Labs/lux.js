var gulp = require( "gulp" );
var sourcemaps = require( "gulp-sourcemaps" );
var traceur = require( "gulp-traceur" );
var rename = require( "gulp-rename" );
var header = require( "gulp-header" );
var imports = require( "gulp-imports" );
var pkg = require( "./package.json" );
var hintNot = require( "gulp-hint-not" );
var uglify = require( "gulp-uglify" );
var _ = require("lodash");

var banner = [ "/**",
	" * <%= pkg.name %> - <%= pkg.description %>",
	" * Author: <%= pkg.author %>",
	" * Version: v<%= pkg.version %>",
	" * Url: <%= pkg.homepage %>",
	" * License(s): <% pkg.licenses.forEach(function( license, idx ){ %><%= license.type %> Copyright (c) 2014 LeanKit<% if(idx !== pkg.licenses.length-1) { %>, <% } %><% }); %>",
	" */",
	"" ].join( "\n" );

gulp.task("default", function() {
	return gulp.src( "src/lux.js" )
		.pipe( imports() )
		.pipe( hintNot() )
		.pipe( sourcemaps.init() )
		.pipe( header( banner, {
			pkg: pkg
		} ) )
		.pipe( rename( "lux-es6.js" ) )
		.pipe( gulp.dest( "lib/" ) )
		.pipe( traceur( {
			script: "lux",
			outputLanguage: "es5",
			arrayComprehension: true
		} ) )
		.pipe( header( banner, {
			pkg: pkg
		} ) )
		.pipe( sourcemaps.write() )
		.pipe( rename( "lux.js" ) )
		.pipe( gulp.dest( "lib/" ) )
		.pipe( uglify( {
			compress: {
				negate_iife: false
			}
		} ) )
		.pipe( header( banner, {
			pkg: pkg
		} ) )
		.pipe( rename( "lux.min.js" ) )
		.pipe( gulp.dest( "lib/" ) );
});

function runTests( options, done ) {
	var karma = require( "karma" ).server;
	karma.start( _.extend( {
		configFile: __dirname + "/karma.conf.js",
		singleRun: true

	// no-op keeps karma from process.exit'ing gulp
	}, options ), done || function () {}  );
}

gulp.task( "test", function ( done ) {
	// There are issues with the osx reporter keeping
	// the node process running, so this forces the main
	// test task to not show errors in a notification
	runTests( { reporters: [ "story" ] }, function ( err ) {
		if ( err !== 0 ) {
			// Exit with the error code
			process.exit( err );
		} else {
			done( null );
		}
	});
});

var mocha = require( "gulp-spawn-mocha" );
gulp.task( "mocha", function () {
	return gulp.src(["spec/**/*.spec.js"], {read: false})
		.pipe(mocha({
			r: [ "spec/helpers/node-setup.js" ],
			R: "spec",
			c: true,
			inlineDiffs: true,
			debug: false
		}))
		.on("error", console.warn.bind(console));
});

gulp.task("watch", function() {
	gulp.watch("src/**/*", ["default"]);
	gulp.watch("{lib,spec}/**/*", ["mocha"]);
});
