const fs = require("fs");
const gulp = require("gulp");
const inject = require("gulp-inject-string");
const rename = require("gulp-rename");
const rollup = require("gulp-better-rollup");

// A versatile compilation function
// Uses Rollup to resolve dependencies, then minifies the result
const build = (moduleName, path, format = "iife") =>
  gulp
    .src(path)
    .pipe(rollup({ moduleName, format }))
    .pipe(rename(moduleName + ".js"))
    .pipe(gulp.dest("build/"));

// The kernel is a foundation for userspace, which gets injected in later on
gulp.task("kernel", () => build("faux", "src/kernel/index.js", "umd"));

// A core library
gulp.task("lib", () => build("lib", "src/userspace/lib/index.js"));

// Init process
gulp.task("init", () => build("init", "src/userspace/init.js"));

// The Faux SHell
gulp.task("fsh", () => build("fsh", "src/userspace/fsh/index.js"));

// The Javascript SHell
gulp.task("jsh", () => build("jsh", "src/userspace/jsh/index.js"));

// ls
gulp.task("ls", () => build("ls", "src/userspace/bin/ls.js"));

// Get the builds out of the way, before we inject them into the kernel
gulp.task("builds", ["kernel", "lib", "init", "fsh", "jsh", "ls"]);

// Convert a file's contents into a JSON-safe string
const jsStringEmbed = path => JSON.stringify(fs.readFileSync(path).toString());

// Inject everything
gulp.task("default", ["builds"], () =>
  gulp
    .src("build/faux.js")
    // Inject core library into each process
    .pipe(inject.replace(/\"inject-lib\"/, jsStringEmbed("build/lib.js")))
    // Inject init into its kernel-made process
    .pipe(inject.replace(/\"inject-init\"/, jsStringEmbed("build/init.js")))
    // Inject fsh into its own file
    .pipe(inject.replace(/\"inject-fsh\"/, jsStringEmbed("build/fsh.js")))
    // Inject jsh
    .pipe(inject.replace(/\"inject-jsh\"/, jsStringEmbed("build/jsh.js")))
    // ls
    .pipe(inject.replace(/\"inject-ls\"/, jsStringEmbed("build/ls.js")))
    // Inject version from package.json
    .pipe(inject.replace(/inject-version/, require("./package.json").version))
    // Output to dist/
    .pipe(rename("fauxOS.js"))
    .pipe(gulp.dest("dist/"))
);

// For development: run `gulp watch` to build on file save
gulp.task("watch", () => gulp.watch("src/**/*.js", ["default"]));
