var gulp = require('gulp');
var pump = require('pump');
var order = require('gulp-order');
var concat = require('gulp-concat');
var inject = require('gulp-inject');
var babel = require('gulp-babel')
var uglify = require('gulp-uglify');

gulp.task("fs", function(cb) {
  pump([
    gulp.src("src/kernel/fs/*.js"),
    order([
      "pathname.js",
      "disk.js",
      "vfs.js",
      "tree.js",
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

gulp.task("kernel", ["fs", "proc"], function(cb) {
  pump([
    gulp.src( ["src/kernel/obj.js", "build/kernel/*.js"] ),
    order([
      "obj.js",
      "fs.js",
      "proc.js",
      "*"
    ]),
    concat("kernel.js"),
    gulp.dest("build/")
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
    gulp.dest("build/programs/")
  ], cb);
});


gulp.task("inject:lib", ["lib", "kernel"], function(cb) {
  pump([
    gulp.src( ["build/kernel.js"] ),
    inject(gulp.src( ["build/programs/lib.js"] ), {
      starttag: "/* lib */",
      endtag: "/* end */",
      transform: function (filePath, file) {
        return file.contents.toString("utf8");
      }
    }),
    gulp.dest("build/")
  ], cb);
});

gulp.task("programs", ["inject:lib"]);

gulp.task("default", ["kernel", "programs"], function(cb) {
  pump([
    gulp.src( ["src/misc/*.js", "build/kernel.js"] ),
    order([
      "misc.js",
      "kernel.js",
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