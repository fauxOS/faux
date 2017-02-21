var gulp = require('gulp');
var pump = require('pump');
var changed = require('gulp-changed');
var order = require("gulp-order");
var concat = require('gulp-concat');
var babel = require('gulp-babel')
var uglify = require('gulp-uglify');

gulp.task("system", function(cb) {
  pump([
    gulp.src("src/system/**/*.js"),
    order([
      "kernel/pathname.js",
      "kernel/fs/*",
      "computer.js"
    ]),
    concat("system.js"),
    gulp.dest("temp_build/")
  ], cb);
});

gulp.task("finalize", function(cb) {
  pump([
    gulp.src( ["src/lib/**/*", "temp_build/**/*"] ),
    concat("fauxOS.js"),
    babel({
      presets: ["es2015"]
    }),
    uglify( {mangle: false} ),
    gulp.dest("./"),
  ], cb);
});

gulp.task("default", [ "system" ]);