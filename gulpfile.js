var gulp = require('gulp');
var pump = require('pump');
var order = require('gulp-order');
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
    gulp.dest("build/kernel/")
  ], cb);
});

gulp.task("proc", function(cb) {
  pump([
    gulp.src("src/kernel/proc/*.js"),
    order([
      "filedesc.js",
      "process.js",
      "*"
    ]),
    concat("proc.js"),
    gulp.dest("build/kernel/")
  ], cb);
});

gulp.task("lib", function(cb) {
  pump([
    gulp.src( ["src/programs/lib/*.js"] ),
    order([
      "lib.js",
      "*"
    ]),
    concat("lib.js"),
    babel({
      presets: ["es2015"]
    }),
    uglify( {mangle: false} ),
    gulp.dest("dist/")
  ], cb);
});

gulp.task("default", ["fs", "proc", "lib"], function(cb) {
  pump([
    gulp.src( ["src/misc/*.js", "build/kernel/*.js", "src/computer.js"] ),
    order([
      "misc.js",
      "kernel.js",
      "fs.js",
      "computer.js",
      "proc.js",
      "*"
    ]),
    concat("fauxOS.js"),
    babel({
      presets: ["es2015"]
    }),
    uglify( {mangle: false} ),
    gulp.dest("dist/")
  ], cb);
});
