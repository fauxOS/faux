/*
 * Path name manipulations
 * p = new Pathname("/some///./../some/strange/././path")
 * p.clean() => "/some/strange/path"
 */
class Pathname {
  constructor(input) {
    this.input = input;
  }

  // clean up a crazy path
  // e.g. "/some///./../some/strange/././path" => "/some/strange/path"
  clean() {
    let clean = [];
    // Split the path by "/", match() because it doesn't add empty strings
    const pathArray = this.input.match( /[^/]+/g );
    // Iterate each name in the path
    for (let i in pathArray) {
      const name = pathArray[i];
      // If it's the current directory, don't do anything
      if (name === ".") {}
      // If it's the previous directory, remove the last added entry
      else if (name === "..") { clean.pop() }
      // Anything else, we add to the array plainly
      else { clean.push(name) }
    }
    // Array to path
    return "/" + clean.join("/");
  }

  // Chop a path into an array of names
  // "/paths/are/like/arrays" => ["paths", "are", "like", "arrays"]
  chop() {
    const segments = this.clean().match( /[^/]+/g );
    if (segments === null) {
      return ["/"];
    }
    else {
      return segments;
    }
  }

  // Just the name of the file/directory the path leads to
  name() {
    return this.chop().pop()
  }

  // Basename from the normal name
  // "filename.txt" => "filename"
  basename() {
    const name = this.name();
    if ( name === "" ) {
      return name;
    }
    else {
      const base = name.match( /^[^\.]+/ );
      if (base !== null) {
        return base[0];
      }
      else {
        return "";
      }
    }
  }

  // Parent name, get the directory holding this
  // "/directories/hold/files/like-this-one" => "/directories/hold/files"
  parent() {
    if ( this.name() === "/" ) {
      return null;
    }
    else {
      // Get the length of the path without the name in it
      const parentLen = this.clean().length - this.name().length;
      // Slice the name out of the path
      return this.clean().slice( 0, parentLen );
    }
  }

  // Extentions array from the name
  // "archive.tar.gz" => [".tar", ".gz"]
  extentions() {
    return this.name().match( /\.[^\.]+/g );
  }
}