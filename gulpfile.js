const fs = require("fs");
const gulp = require("gulp");
const gulpIf = require("gulp-if");
const inject = require("gulp-inject-string");
const babili = require("gulp-babili");
const rename = require("gulp-rename");
const rollup = require("gulp-better-rollup");

// A versatile compilation function
// Uses Rollup to resolve dependencies, then minifies the result
function build(name, path, minify = true, format = "iife") {
  return gulp
    .src(path)
    .pipe(
      rollup({
        format: format,
        moduleName: name
      })
    )
    .pipe(
      gulpIf(
        minify,
        babili({
          mangle: false
        })
      )
    )
    .pipe(rename(name + ".js"))
    .pipe(gulp.dest("build/"));
}

// The kernel is a foundation for all the other code
// Even the userspace gets plugged into the kernel via the VFS
// This is why the kernel is the only module that must be in UMD format
gulp.task("kernel", function() {
  return build("faux", "src/kernel/index.js", false, "umd");
});

// A standard library
gulp.task("lib:build", function() {
  return build("lib", "src/userspace/lib/index.js");
});

// The Faux SHell
gulp.task("fsh:build", function() {
  return build("fsh", "src/userspace/fsh/index.js");
});

// Get the builds out of the way, before we inject them into the kernel
gulp.task("builds", ["kernel", "lib:build", "fsh:build"]);

// Injections

function toSingleLineString(file) {
  return JSON.stringify(require(file));
}

gulp.task("injections", ["builds"], function() {
  return (gulp
      .src("build/faux.js")
      // Inject core library into each process
      .pipe(
        inject.replace(
          /\"inject-lib\"/,
          JSON.stringify(fs.readFileSync("build/lib.js").toString())
        )
      )
      // Inject fsh into its own file
      .pipe(
        inject.replace(
          /\"inject-fsh\"/,
          JSON.stringify(fs.readFileSync("build/fsh.js").toString())
        )
      )
      // Inject version from package.json
      .pipe(
        inject.replace(
          /\"inject-version\"/,
          JSON.stringify(require("./package.json").version)
        )
      )
      .pipe(gulp.dest("build/")) );
});

// Final distributed files
gulp.task("default", ["injections"], function() {
  return (gulp
      .src("build/faux.js")
      // Fully-readable version
      .pipe(rename("fauxOS.js"))
      .pipe(gulp.dest("dist/"))
      // Minified version
      .pipe(babili({ mangle: false }))
      .pipe(rename("fauxOS.min.js"))
      .pipe(gulp.dest("dist/")) );
});

gulp.task("watch", function() {
  gulp.watch("src/**/*.js", ["default"]);
});
