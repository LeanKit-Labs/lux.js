var gulp = require( "gulp" );
var gutil = require( "gulp-util" );
var webpack = require( "webpack" );
var webpackConfig = require( "./webpack.config.js" );
var express = require( "express" );
var path = require( "path" );
var open = require( "open" ); //jshint ignore:line
var livereload = require( "gulp-livereload" );
var port = 3080;
// modify some webpack config options
var myDevConfig = Object.create( webpackConfig );
myDevConfig.devtool = "sourcemap";
myDevConfig.debug = true;

// create a single instance of the compiler to allow caching
var devCompiler = webpack( myDevConfig );

// The development server (the recommended option for development)
gulp.task( "default", [ "server" ] );

// Build and watch cycle (another option for development)
// Advantage: No server required, can run app from filesystem
// Disadvantage: Requests are not blocked until bundle is available,
//               can serve an old app on refresh
gulp.task( "build-dev", [ "webpack:build-dev" ], function() {
    livereload.listen();
    gulp.watch( [ "public/**/*", "../lib/**/*" ], [ "webpack:build-dev" ] );
    gulp.watch( [ "public/{css,images,js-dist}/**/*" ] )
        .on( "change", livereload.changed );
} );

gulp.task( "webpack:build-dev", function( callback ) {
    // run webpack
    console.log( "running" );
    devCompiler.run( function( err, stats ) {
        if ( err ) {
            throw new gutil.PluginError( "webpack:build-dev", err );
        }
        gutil.log( "[webpack:build-dev]", stats.toString( {
            colors: true
        } ) );
        callback();
    } );
} );

var createServer = function( port ) {
    var p = path.resolve( "./public" );
    var app = express();
    app.use( express.static( p ) );
    app.listen( port, function() {
        gutil.log( "Listening on", port );
    } );

    return {
        app: app
    };
};

var servers;

gulp.task( "server", [ "build-dev" ], function() {
    if ( !servers ) {
        servers = createServer( port );
    }
    open( "http://localhost:" + port + "/index.html" );
} );