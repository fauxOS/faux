const gulp = require("gulp");
const gulpIf = require("gulp-if");
const inject = require("gulp-inject");
const babili = require("gulp-babili");
const rename = require("gulp-rename");
const rollup = require("gulp-better-rollup");

// A versatile compilation function
// Uses Rollup to resolve dependencies, then minifies the result
function build(name, path, minify = true, format = "es") {
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

// The userspace's system call functions
// Just a single file so we will only have to minify
gulp.task("syscalls:build", function() {
  return gulp
    .src("src/userspace/syscalls.js")
    .pipe(babili({ mangle: false }))
    .pipe(gulp.dest("build/"));
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
gulp.task("builds", ["kernel", "syscalls:build", "lib:build", "fsh:build"]);

// Injections

gulp.task("syscalls", ["builds"], function() {
  return gulp
    .src("build/faux.js")
    .pipe(
      inject(gulp.src(["build/syscalls.js"]), {
        starttag: "/* syscalls */",
        endtag: "/* end */",
        transform: function(filePath, file) {
          return JSON.stringify(file.contents.toString("utf8"));
        }
      })
    )
    .pipe(gulp.dest("build/"));
});

gulp.task("lib", ["syscalls"], function() {
  return gulp
    .src("build/faux.js")
    .pipe(
      inject(gulp.src(["build/lib.js"]), {
        starttag: "/* lib */ data: ",
        endtag: "/* end */",
        transform: function(filePath, file) {
          return JSON.stringify(file.contents.toString("utf8"));
        }
      })
    )
    .pipe(gulp.dest("build/"));
});

gulp.task("fsh", ["lib"], function() {
  return gulp
    .src("build/faux.js")
    .pipe(
      inject(gulp.src(["build/fsh.js"]), {
        starttag: "/* fsh */ data: ",
        endtag: "/* end */",
        transform: function(filePath, file) {
          return JSON.stringify(file.contents.toString("utf8"));
        }
      })
    )
    .pipe(gulp.dest("build/"));
});

// Final distributed files
gulp.task("default", ["syscalls", "lib", "fsh"], function() {
  return (gulp
      .src("build/faux.js")
      .pipe(
        inject(gulp.src(["package.json"]), {
          starttag: 'version: "',
          endtag: '"',
          transform: function(filePath, file) {
            // Extract version from the package.json
            return JSON.parse(file.contents.toString("utf8")).version;
          }
        })
      )
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
