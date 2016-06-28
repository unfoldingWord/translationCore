// Load modules which are installed through NPM.
var gulp = require('gulp'),
  browserify = require('browserify'),  // Bundles JS.
  del = require('del'),  // Deletes files.
// reactify = require('reactify'),  // Transforms React JSX to JS.
  babelify = require('babelify'),
  bablePresetReact = require('babel-preset-react'),
  source = require('vinyl-source-stream'),
  shell = require('gulp-shell');

// Define paths
var paths = {
  indexJS: ['./src/js/index.js'],
  js: ['src/js/*.js']
};

// The default task (called when we run `gulp` from cli)
gulp.task('default', ['watch', 'js']);

// Rerun tasks whenever a file changes.
gulp.task('watch', function() {
  gulp.watch(paths.js, ['js']);
  gulp.watch(paths.js, ['lint']);
});

// An example of a dependency task, it will be run before the css/js tasks.
// Dependency tasks should call the callback to tell the parent task that
// they're done.
// gulp.task('clean', function() {
//   del.sync(['dist']);
// });

// Our JS task. It will Browserify our code and compile React JSX files.
gulp.task('js', function() {
// Browserify/bundle the JS.
  browserify(paths.indexJS)
  .transform('babelify', {presets: ['react']})
  .bundle()
  .on('error', swallowError)
  .pipe(source('app.js'))
  .pipe(gulp.dest('./dist/js/'));
});

gulp.task('lint', shell.task([
  'eslint src/js/*'
])).on('error', silentError);

gulp.task('fixLint', shell.task([
  'eslint --fix src/js/*'
])).on('error', silentError)
/**
 * @description: Error handling to keep gulp open
 * @param {error} error - The error to be handled
 ******************************************************************************/
function swallowError(error) {
  console.log(error.toString());
  this.emit('end');
}
/**
 * @description: Error handling to keep gulp open, done silently
 * @param {error} error - The error to be handled
 ******************************************************************************/
function silentError(error) {
  this.emit('end')
}
