/*
 * Path name manipulations
 * p = new Pathname("/some///./../some/strange/././path")
 * p.clean() => "/some/strange/path"
 */
export default class Pathname {
  constructor(input) {
    this.input = input;
    // Make all the functions run right on construction
    this.clean = this.cleanf();
    this.chop = this.chopf();
    this.name = this.namef();
    this.basename = this.basenamef();
    this.parent = this.parentf();
    this.extentions = this.extentionsf();
    this.segment = this.segmentf();
  }

  // clean up a crazy path
  // e.g. "/some///./../some/strange/././path" => "/some/strange/path"
  cleanf() {
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
  chopf() {
    const segments = this.clean.match( /[^/]+/g );
    if (segments === null) {
      return ["/"];
    }
    else {
      return segments;
    }
  }

  // Just the name of the file/directory the path leads to
  namef() {
    return this.chop[ this.chop.length - 1 ];
  }

  // Basename from the normal name
  // "filename.txt" => "filename"
  basenamef() {
    const name = this.name;
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
  parentf() {
    if ( this.name === "/" ) {
      return null;
    }
    else {
      // Get the length of the path without the name in it
      const parentLen = this.clean.length - this.name.length;
      // Slice the name out of the path
      return this.clean.slice( 0, parentLen );
    }
  }

  // Extentions array from the name
  // "archive.tar.gz" => [".tar", ".gz"]
  extentionsf() {
    return this.name.match( /\.[^\.]+/g );
  }

  // get the segments of a path like this : ["/", "/path", "/path/example"]
  segmentf() {
    const pathArray = this.chop;
    let segments = [];
    // If its a root path, skip segments
    if ( this.name === "/" ) {
      segments = ["/"];
    }
    // Else, any other path
    else {
      for (let i = 0; i <= pathArray.length; i++) {
        let matchPath = pathArray.slice(0, i);
        segments.push( "/" + matchPath.join("/") );
      }
    }
    return segments;
  }
}