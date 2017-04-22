var gulp = require("gulp");
var order = require("gulp-order");
var concat = require("gulp-concat");
var inject = require("gulp-inject");
var babili = require("gulp-babili");
var rename = require("gulp-rename");
var rollup = require("rollup");

gulp.task("kernel", function() {
  return rollup
    .rollup({
      entry: "src/kernel/main.js"
    })
    .then(function(bundle) {
      bundle.write({
        format: "umd",
        moduleName: "faux",
        dest: "build/kernel.js",
        sourceMap: false
      });
    });
});

function rollThatUp(name, entry, dest, sourceMap = false) {
  return rollup
    .rollup({
      entry: entry
    })
    .then(function(bundle) {
      bundle.write({
        format: "es",
        moduleName: name,
        dest: dest,
        sourceMap: sourceMap
      });
    });
}

function gulpThatDown(input, output = "build/") {
  return gulp
    .src(input)
    .pipe(babili({ mangle: false }))
    .pipe(gulp.dest(output));
}

function build(name, path, useRollup = true) {
  if (useRollup) {
    var dest = "build/" + name + ".js";
    return rollThatUp(name, path, dest).then(function() {
      gulpThatDown(dest);
    });
  } else {
    return gulpThatDown(path);
  }
}

gulp.task("syscalls:build", function() {
  return build("syscalls", "src/userspace/syscalls.js", false);
});

gulp.task("lib:build", function() {
  return build("lib", "src/userspace/lib/main.js");
});

gulp.task("fsh:build", function() {
  return build("fsh", "src/userspace/fsh/main.js");
});

// Get the builds out of the way,
// before we deal with injecting anything, or compilation
gulp.task("builds", ["kernel", "syscalls:build", "lib:build", "fsh:build"]);

gulp.task("syscalls", ["builds"], function() {
  return gulp
    .src("build/kernel.js")
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
    .src("build/kernel.js")
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
    .src("build/kernel.js")
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

gulp.task("default", ["syscalls", "lib", "fsh"], function() {
  return (gulp
      .src("build/kernel.js")
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
