// Gulp
var gulp = require("gulp");
var order = require("gulp-order");
var concat = require("gulp-concat");
var inject = require("gulp-inject");
var babel = require("gulp-babel");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");

// Rollup
var rollup = require("rollup");

// Misc
var argv = require("yargs").argv;

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

gulp.task("lib:build", function() {
  return gulp
    .src("src/userspace/lib.js")
    .pipe(
      babel({
        presets: [["es2015"]]
      })
    )
    .pipe(
      uglify({
        mangle: false
      })
    )
    .pipe(gulp.dest("build/"));
});

gulp.task("fsh:build", function() {
  rollup
    .rollup({
      entry: "src/userspace/fsh/main.js"
    })
    .then(function(bundle) {
      bundle.write({
        format: "es",
        moduleName: "fsh",
        dest: "build/fsh.js",
        sourceMap: false
      });
    });
  return gulp
    .src("build/fsh.js")
    .pipe(
      babel({
        presets: [["es2015"]]
      })
    )
    .pipe(
      uglify({
        mangle: false
      })
    )
    .pipe(gulp.dest("build/"));
});

// Get the builds out of the way,
// before we deal with injecting anything, or compilation
gulp.task("builds", ["kernel", "lib:build", "fsh:build"]);

gulp.task("lib", ["builds"], function() {
  return gulp
    .src("build/kernel.js")
    .pipe(
      inject(gulp.src(["build/lib.js"]), {
        starttag: "/* lib.js */ data: ",
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

gulp.task("default", ["lib", "fsh"], function() {
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
      // ES6 non-transpiled version
      .pipe(rename("fauxOS.es6.js"))
      .pipe(gulp.dest("dist/"))
      // Babel transpiled version
      .pipe(
        babel({
          presets: [["es2015", { modules: false }]]
        })
      )
      .pipe(rename("fauxOS.js"))
      .pipe(gulp.dest("dist/"))
      // Minified version
      .pipe(
        uglify({
          mangle: false
        })
      )
      .pipe(rename("fauxOS.min.js"))
      .pipe(gulp.dest("dist/")) );
});
