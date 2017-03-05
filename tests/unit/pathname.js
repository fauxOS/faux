define(function (require) {
  var registerSuite = require('intern!object');
  var assert = require('intern/chai!assert');
  var expect = require('intern/chai!expect');
  require('dist/fauxOS.js');
  const g = {};

  registerSuite({
    name: "Pathname",

    setUp: function() {
      g.path = new Pathname("/hello/././///../waddup//path//././world.tar.gz");
    },

    "Basename": function() {
      assert.deepEqual(g.path.basename, "world",
        "Extracts a file or directory's basename");
    },
    "Chop path segments": function() {
      assert.deepEqual(g.path.chop, ["waddup", "path", "world.tar.gz"],
        "Chops a path into segments");
    },
    "Clean / normalize": function() {
      assert.deepEqual(g.path.clean, "/waddup/path/world.tar.gz",
        "Cleans up / normalizes a messy path");
    },
    "Extentions array": function() {
      assert.deepEqual(g.path.extentions, [".tar", ".gz"],
        "Can return an array of the file's extentions");
    },
    "Name": function() {
      assert.deepEqual(g.path.name, "world.tar.gz",
        "Gets a file or directory name");
    },
    "Parent path": function() {
      assert.deepEqual(g.path.parent, "/waddup/path/",
        "Finds the file or directory's parent directory");
    },
    "Path segments": function() {
      assert.deepEqual(g.path.segment, ["/", "/waddup", "/waddup/path", "/waddup/path/world.tar.gz"],
        "Can extract an array of every path from root to the input file/dir");
    }
  });
});