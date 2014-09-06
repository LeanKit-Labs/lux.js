var gulp = require( 'gulp' );
var sourcemaps = require( 'gulp-sourcemaps' );
var traceur = require( 'gulp-traceur' );
var rename = require( "gulp-rename" );
var imports = require( "gulp-imports" );

gulp.task('default', function() {
  return gulp.src( 'src/lux.js' )
  	.pipe( imports() )
    .pipe( sourcemaps.init() )
    .pipe( traceur( {
      script: "lux",
  		outputLanguage: 'es5',
      arrayComprehension: true
    } ) )
    .pipe( sourcemaps.write() )
    .pipe( gulp.dest( 'lib/' ) )
});

gulp.task('watch', function() {
    gulp.watch('src/*.js', ['default']);
});