var gulp = require('gulp');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var stylish = require('jshint-stylish');
var runSequence = require('run-sequence');

var jsfiles = ['lib/**/*.js'];

gulp.task('lint', function() {
  return gulp.src(jsfiles)
    .pipe(jshint())
    .pipe(jscs())
    .pipe(jshint.reporter(stylish))
    .pipe(jscs.reporter());
});

gulp.task('test', function() {
  return gulp.src('test/**/*.js', { read: false })
    .pipe(mocha({ ui: 'bdd' }));
});

gulp.task('default', function(cb) {
  return runSequence('lint', 'test', cb);
});
