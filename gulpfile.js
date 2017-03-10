var gulp = require('gulp');
var pump = require('pump');
var order = require('gulp-order');
var concat = require('gulp-concat');
var inject = require('gulp-inject');
var babel = require('gulp-babel')
var uglify = require('gulp-uglify');
var through = require('through2');

// Object File System
gulp.task("ofs", function(cb) {
  pump([
    gulp.src(["src/kernel/fs/ofs/*.js"]),
    order([
      "drive.js",
      "*"
    ]),
    concat("ofs.js"),
    gulp.dest("build/kernel/fs")
  ], cb);
});

// Virtual File System Layer
gulp.task("vfs", function(cb) {
  pump([
    gulp.src(["src/kernel/fs/vfs/*.js"]),
    order([
      "storage.js",
      "*"
    ]),
    concat("vfs.js"),
    gulp.dest("build/kernel/fs")
  ], cb);
});

// Put the file system together
gulp.task("fs", ["ofs", "vfs"], function(cb) {
  pump([
    gulp.src(["build/kernel/fs/*.js", "src/kernel/fs/*.js"]),
    order([
      "pathname.js",
      "ofs.js",
      "vfs.js",
      "default.js",
      "*"
    ]),
    concat("fs.js"),
    gulp.dest("build/kernel/")
  ], cb);
});

// Processes
gulp.task("proc", function(cb) {
  pump([
    gulp.src(["src/kernel/proc/*.js"]),
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
    gulp.src(["src/kernel/obj.js", "build/kernel/*.js"]),
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

// Main userspace library
gulp.task("lib", function(cb) {
  pump([
    gulp.src(["src/userspace/lib/*.js"]),
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

// Injects a file into the default filesystem
function injectVFS(path, starttag, endtag="/* endinject */") {
  return gulp.src( ["build/kernel.js"] ).pipe(
    inject(gulp.src(path), {
      starttag: starttag,
      endtag: endtag,
      transform: function (filePath, file) {
        return file.contents.toString("utf8");
      }
    })
  );
}

// Userspace programs
gulp.task("userspace", ["kernel", "lib"], function(cb) {
  pump([
    injectVFS("build/userspace/lib.js", "/* lib.js */"),
    gulp.dest("build/")
  ], cb);
});

// Default task, entrypoint, compiles kernel
gulp.task("default", ["userspace"], function(cb) {
  pump([
    gulp.src(["src/misc/*.js", "build/kernel.js"]),
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
