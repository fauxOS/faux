var gulp = require('gulp');
var pump = require('pump');
var changed = require('gulp-changed');
var order = require("gulp-order");
var concat = require('gulp-concat');
var babel = require('gulp-babel')
var uglify = require('gulp-uglify');

gulp.task("fs", function(cb) {
  pump([
    gulp.src("src/kernel/fs/*.js"),
    order([
      "pathname.js",
      "disk.js",
      "vfs.js",
      "*"
    ]),
    concat("fs.js"),
    gulp.dest("build/.kernel/")
  ], cb);
});

gulp.task("proc", function(cb) {
  pump([
    gulp.src("src/kernel/proc/*.js"),
    order([
      "*"
    ]),
    concat("proc.js"),
    gulp.dest("build/.kernel/")
  ], cb);
});

gulp.task("kernel", ["fs", "proc"], function(cb) {
  pump([
    gulp.src("build/.kernel/*.js"),
    order([
      "fs.js",
      "proc.js",
      "*"
    ]),
    concat("kernel.js"),
    gulp.dest("build/")
  ], cb);
});

gulp.task("default", ["kernel"], function(cb) {
  pump([
    gulp.src( ["src/misc.js", "build/*.js", "src/computer.js"] ),
    order([
      "misc.js",
      "kernel.js",
      "*",
      "computer.js"
    ]),
    concat("fauxOS.js"),
    babel({
      presets: ["es2015"]
    }),
    uglify( {mangle: false} ),
    gulp.dest("./"),
  ], cb);
});