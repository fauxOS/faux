// Throws an error if argument is not a string
function assertString(str) {
  if (typeof str !== "string") {
    throw new Error("Some argument is not a string");
  }
}

// normalize a crazy path
// e.g. "/the///./../a/crazy/././path" => "/a/crazy/path"
export function normalize(path) {
  // Empty or no input
  if (!path) {
    return ".";
  }
  // Assume relative path,
  let isAbsolute = false;
  // but reassign if absolute
  if (path.indexOf("/") === 0) {
    isAbsolute = true;
  }

  const significant = (path.match(/[^/]+/g) || []) // Split path on "/" into an array
    .filter(name => name !== ".") // Remove redundant current directory names "."
    .reduce(
      (pathArray, name) =>
        // If a normal name, array is empty, or child of an unresolved ".."
        name !== ".." ||
        !pathArray.length ||
        pathArray[pathArray.length - 1] === ".."
          ? [...pathArray, name] // Add to the path array
          : pathArray.slice(0, -1), // Otherwise remove the last name
      []
    );

  if (isAbsolute) {
    return "/" + significant.join("/");
  } else {
    return significant.join("/");
  }
}

// Splits POSIX path ("/directories/leading/to/file.ext") into
// 1: "/" (if absolute)
// 2: "directories/leading/to/" (if any)
// 3: "file.ext" (the basename)
// 4: ".ext" (extention)
const splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;

// POSIX parse the path
export function parse(path = "") {
  assertString(path);
  // Use the POSIX path split regex
  const [, root, parent, base, extention] = normalize(path).match(splitPathRe);
  return {
    absolute: !!root,
    parent,
    base,
    extention,
    name: base.slice(0, base.length - extention.length)
  };
}

// Get the parent directory name
// "/directories/hold/files/like-this-one" -> "/directories/hold/files"
export function parentname(path = "") {
  const parsed = parse(path);
  // If absolute path
  if (parsed.absolute) {
    return "/" + parsed.parent;
  } else {
    return parsed.parent;
  }
}

// Basename from the normal name
// "/path/to/filename.txt" => "filename.txt"
// You can also specify an extention
// basename("filename.txt", ".txt") => "filename"
export function basename(path = "", extension = "") {
  const basename = parse(path).base;
  // The basename is returned unless an extension argument is set and valid
  const indexOf = basename.indexOf(extension);
  // Extention must be included specifically at the end of the basename
  if (indexOf && indexOf + extension.length === basename.length) {
    return basename.slice(0, indexOf);
  } else {
    return basename;
  }
}

// Chop a path into an array of names
// "/paths/are/just/arrays" => ["paths", "are", "just", "arrays"]
export const chop = path => normalize(path).match(/[^/]+/g) || [];
