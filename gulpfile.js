var gulp = require('gulp');
var pump = require('pump');
var order = require('gulp-order');
var concat = require('gulp-concat');
var inject = require('gulp-inject');
var babel = require('gulp-babel')
var uglify = require('gulp-uglify');
var through = require('through2');

// File System
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

// Processes
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

// Kernel, connects filesystem with processes
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

// Injects a file into the default filesystem
function injectVFS(path, starttag, endtag="/* endinject */") {
  return gulp.src( ["build/kernel.js"] )
  .pipe(inject(gulp.src("path"), {
    starttag: starttag,
    endtag: endtag,
    transform: function (filePath, file) {
      return file.contents.toString("utf8");
    }
  }));
}

// Main userspace library
gulp.task("lib", function(cb) {
  pump([
    gulp.src( ["src/userspace/lib/*.js"] ),
    order([
      "lib.js",
      "*"
    ]),
    concat("lib.js"),
    babel({
      presets: ["es2015"]
    }),
    uglify( {mangle: false} ),
    gulp.dest("build/userspace")
  ], cb);
});

// Userspace programs
gulp.task("userspace", ["lib"], function(cb) {
  injectVFS("build/userspace/lib.js", "/* lib.js */")
});

// Default task, entrypoint, compiles kernel
gulp.task("default", ["kernel", "userspace"], function(cb) {
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