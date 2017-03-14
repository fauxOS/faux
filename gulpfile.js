var gulp = require('gulp');
var pump = require('pump');
var order = require('gulp-order');
var concat = require('gulp-concat');
var inject = require('gulp-inject');
var babel = require('gulp-babel')
var uglify = require('gulp-uglify');
var through = require('through2');
var argv = require("yargs").argv;

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

// DOM File System Layer
gulp.task("domfs", function(cb) {
  pump([
    gulp.src(["src/kernel/fs/domfs/*.js"]),
    order([
      "selector.js",
      "*"
    ]),
    concat("domfs.js"),
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
gulp.task("fs", ["ofs", "domfs", "vfs"], function(cb) {
  pump([
    gulp.src(["build/kernel/fs/*.js", "src/kernel/fs/*.js"]),
    order([
      "pathname.js",
      "ofs.js",
      "domfs.js",
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
      "syscalls.js",
      "*"
    ]),
    concat("proc.js"),
    gulp.dest("build/kernel/")
  ], cb);
});

// Kernel, connects filesystem with processes
gulp.task("kernel", ["fs", "proc"], function(cb) {
  pump([
    gulp.src(["build/kernel/*.js"]),
    order([
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

// Uglify or nah?
function finalCompile() {

}

// Default task, entrypoint, compiles kernel
gulp.task("default", ["userspace"], function() {
  const built = gulp.src(["src/misc/*.js", "build/kernel.js"])
  .pipe(order([
    "namespace.js",
    "misc.js",
    "compat.js",
    "kernel.js",
    "*"
  ]))
  .pipe( concat("fauxOS.js") )

  if (! argv.uglify) {
    built.pipe( gulp.dest("dist/") );
  }
  else {
    built.pipe(babel({
      presets: ["es2015"]
    }))
    .pipe( uglify( {mangle: false} ) )
    .pipe( gulp.dest("dist/") );
  }
});