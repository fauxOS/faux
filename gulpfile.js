// Gulp
var gulp = require("gulp");
var pump = require("pump");
var order = require("gulp-order");
var concat = require("gulp-concat");
var inject = require("gulp-inject");
var babel = require("gulp-babel")
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");

// Rollup
var rollup = require("rollup");

// Misc
var argv = require("yargs").argv;

gulp.task("kernel", function () {
  return rollup.rollup({ entry: "src/kernel/main.js" })
    .then(function (bundle) {
      bundle.write({
        format: "umd",
        moduleName: "faux",
        dest: "build/kernel.js",
        sourceMap: true
      });
    });
});

gulp.task("lib:build", function() {
  return gulp.src("src/userspace/lib.js")
  .pipe(babel({
    presets: [
      ["es2015"]
    ]
  }))
  .pipe(uglify({
    mangle: false
  }))
  .pipe( gulp.dest("build/") );
});

// Get the builds out of the way,
// before we deal with injecting anything, or compilation
gulp.task("builds", ["kernel", "lib:build"]);

gulp.task("lib", ["builds"], function() {
  return gulp.src("build/kernel.js")
    .pipe(inject(gulp.src(["build/lib.js"]), {
      starttag: '/* lib.js */data: `',
      endtag: '`',
      transform: function (filePath, file) {
        return file.contents.toString("utf8");
      }
    }))
    .pipe( gulp.dest("build/") );
});

gulp.task("default", ["lib"], function() {
  return gulp.src("build/kernel.js")
    .pipe(inject(gulp.src(["package.json"]), {
      starttag: 'version: "',
      endtag: '"',
      transform: function (filePath, file) {
        // Extract version from the package.json
        return JSON.parse( file.contents.toString("utf8") ).version;
      }
    }))
    .pipe(babel({
      presets: [
        ["es2015", {"modules": false}]
      ]
    }))
    .pipe(uglify({
      mangle: false
    }))
    .pipe( rename("fauxOS.js") )
    .pipe( gulp.dest("dist/") );
});