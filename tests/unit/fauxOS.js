define(function (require) {
  var registerSuite = require('intern!object');
  var assert = require('intern/chai!assert');
  var expect = require('intern/chai!expect');
  require('fauxOS.js');
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

  registerSuite({
    name: "Disk",

    setUp: function() {
      g.rootDisk = box.fs.mounts["/"];
      g.rootInode = box.fs.resolve("/");
      g.inode = g.rootDisk.addInode("type", "name", g.rootInode);
      g.rootDisk.mkLink("linkToName", g.rootInode, g.inode);
      g.symLinkID = g.rootDisk.mkSymLink("symLinkToName", g.rootInode, "/./relative/link/../../name");
    },

    "Adds inodes to the table correctly": function() {
      assert.equal(g.rootDisk.addInode("type", "name/with/slashes", 0), -1,
        "Adding an inode with slashes returns -1");
    },
    "Adds inodes to parent directory list": function() {
      assert.equal(g.rootInode.files["name"], g.inode.id,
        "Adds an entry to its parent directory");
    },
    "Linking inodes works": function() {
      assert.equal(g.rootInode.files["linkToName"], g.inode.id,
        "Hard linking works");
      assert.equal(g.rootDisk.inodes[ g.rootDisk.inodes[0].files["symLinkToName"] ].redirect, "/name",
        "Symbolic links are clean and redirect to set path");
    }
  });

  registerSuite({
    name: "VFS",

    "Mount and unmount": function() {
      var someDisk = box.fs.mount(new Disk(), "/blah");

      assert.isTrue(someDisk instanceof Disk,
        "VFS.mount returns the disk");
      assert.equal(box.fs.mounts["/blah"], someDisk,
        "Mounts disk to given mount point");
      assert.isTrue(box.fs.unmount("/blah"),
        "Returns true on unmount");
      assert.isUndefined(box.fs.mounts["/blah"],
        "Unmount properly removes from mounts list");

      var otherDisk = box.fs.mount(new Disk(), "/doop");

      assert.isTrue(box.fs.unmountByUUID( otherDisk.uuid ),
        "can unmount by disk uuid");
      assert.isUndefined(box.fs.mounts["/doop"],
        "Unmounting by a UUID properly removes from mounts list");
    },

    "Resolve a disk from path": function() {
      box.fs.getDisk("/");
    },

    "Resolve paths to inodes": function() {
      box.fs.resolveHard("/");
      box.fs.resolve("/");
    }
  });
});
