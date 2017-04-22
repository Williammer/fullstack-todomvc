var gulp = require('gulp');
var minify = require('gulp-minifier');
var del = require('del');


// remove existing dist folder
gulp.task('clean', function() {
  del.sync(['dist/**']);
});

// minify client files
gulp.task('min-client', function() {
  return gulp.src('client/**/*').pipe(minify({
    minify: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    minifyJS: true,
    minifyCSS: true,
    getKeptComment: function(content, filePath) {
      var m = content.match(/\/\*![\s\S]*?\*\//img);
      return m && m.join('\n') + '\n' || '';
    }
  })).pipe(gulp.dest('dist/client'));
});

// minify server files
gulp.task('min-server', function() {
  return gulp.src('server/*').pipe(minify({
    minify: true,
    collapseWhitespace: true,
    conservativeCollapse: false,
    minifyJS: true,
    getKeptComment: function(content, filePath) {
      var m = content.match(/\/\*![\s\S]*?\*\//img);
      return m && m.join('\n') + '\n' || '';
    }
  })).pipe(gulp.dest('dist/server'));
});

// start gulp tasks
gulp.task('default', ['clean', 'min-client', 'min-server']);
