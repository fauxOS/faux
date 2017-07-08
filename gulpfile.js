const fs = require("fs");
const gulp = require("gulp");
const gulpIf = require("gulp-if");
const inject = require("gulp-inject-string");
const babili = require("gulp-babili");
const rename = require("gulp-rename");
const rollup = require("gulp-better-rollup");
const ts = require("gulp-typescript");

// A versatile compilation function
// Uses Rollup to resolve dependencies, then minifies the result
const build = (name, path, minify = true, format = "iife") =>
  gulp
    .src(path)
    .pipe(
      rollup({
        moduleName: name,
        format
      })
    )
    .pipe(
      ts({
        allowJs: true,
        target: "es6"
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

// The kernel is a foundation for userspace, which gets injected in later on
gulp.task("kernel", () => build("faux", "src/kernel/index.js", false, "umd"));

// A core library
gulp.task("lib", () => build("lib", "src/userspace/lib/index.js"));

// The Faux SHell
gulp.task("fsh", () => build("fsh", "src/userspace/fsh/index.js"));

// Get the builds out of the way, before we inject them into the kernel
gulp.task("builds", ["kernel", "lib", "fsh"]);

// Convert a file's contents into a JSON-safe string
const jsStringEmbed = path => JSON.stringify(fs.readFileSync(path).toString());

// Inject everything
gulp.task("injections", ["builds"], () =>
  gulp
    .src("build/faux.js")
    // Inject core library into each process
    .pipe(inject.replace(/\"inject-lib\"/, jsStringEmbed("build/lib.js")))
    // Inject fsh into its own file
    .pipe(inject.replace(/\"inject-fsh\"/, jsStringEmbed("build/fsh.js")))
    // Inject version from package.json
    .pipe(inject.replace(/inject-version/, require("./package.json").version))
    // Output to dist/
    .pipe(rename("fauxOS.js"))
    .pipe(gulp.dest("dist/"))
);

// Final minification
gulp.task("default", ["injections"], () =>
  gulp
    .src("dist/fauxOS.js")
    .pipe(babili({ mangle: false }))
    .pipe(rename("fauxOS.min.js"))
    .pipe(gulp.dest("dist/"))
);

// For development: run `gulp watch` to build on file save
gulp.task("watch", () => gulp.watch("src/**/*.js", ["default"]));
