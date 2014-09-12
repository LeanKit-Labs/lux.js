var gulp = require( "gulp" );
var sourcemaps = require( "gulp-sourcemaps" );
var traceur = require( "gulp-traceur" );
var rename = require( "gulp-rename" );
var header = require( "gulp-header" );
var imports = require( "gulp-imports" );
var pkg = require( "./package.json" );
var hintNot = require( "gulp-hint-not" );
var uglify = require( "gulp-uglify" );

var banner = [ "/**",
	" * <%= pkg.name %> - <%= pkg.description %>",
	" * Author: <%= pkg.author %>",
	" * Version: v<%= pkg.version %>",
	" * Url: <%= pkg.homepage %>",
	" * License(s): <% pkg.licenses.forEach(function( license, idx ){ %><%= license.type %><% if(idx !== pkg.licenses.length-1) { %>, <% } %><% }); %>",
	" */",
	"" ].join( "\n" );

gulp.task("default", function() {
	return gulp.src( "src/lux.js" )
		.pipe( imports() )
		.pipe( hintNot() )
		.pipe( sourcemaps.init() )
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

gulp.task("watch", function() {
	gulp.watch("src/*.js", ["default"]);
});