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
  assertString(path);
  // An array to hold the significant path parts
  const significant = [];
  // Assume relative path,
  let isAbsolute = false;
  // but reassign if absolute
  if (path.indexOf("/") === 0) {
    isAbsolute = true;
  }

  // Split the path by "/", match() because it doesn't add empty strings
  const pathArray = path.match(/[^/]+/g);
  // Iterate each name in the path
  for (let i in pathArray) {
    const name = pathArray[i];
    const lastItem = significant[significant.length - 1];
    // We ignore all current directory dots
    if (name === ".") {
    } else if (name === "..") {
      // No parent of the root directory to care about
      if (isAbsolute) {
        significant.pop();
      } else {
        // Push if the array is empty or if there is nothing to pop
        // (Don't pop a "..")
        if (significant.length === 0 || lastItem === "..") {
          significant.push("..");
        } else {
          significant.pop();
        }
      }
    } else {
      // Just push everything else
      significant.push(name);
    }
  }
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
  const normalized = normalize(path);
  // Use the POSIX path split regex
  const matches = normalized.match(splitPathRe);
  return {
    root: matches[1],
    dir: matches[2],
    base: matches[3],
    ext: matches[4],
    name: matches[3].slice(0, matches[3].length - matches[4].length)
  };
}

// Parent name, get the parent directory
// "/directories/hold/files/like-this-one" => "/directories/hold/files"
export function dirname(path = "") {
  const parsed = parse(path);
  // If absolute path
  if (parsed.root) {
    return "/" + parsed.dir;
  } else {
    return parsed.dir;
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

// Get the final extention
export function extname(path) {
  return parse(path).ext;
}

// Join all the arguments into one clean path
export function join() {
  // Because arguments.join is not a function,
  // we have to extract the contents into a new array
  const paths = [];
  for (let i in arguments) {
    // So paths don't end up joining as e.g. /strArg/[object Object]/strArg
    assertString(arguments[i]);
    paths.push(arguments[i]);
  }
  const joined = paths.join("/");
  return normalize(joined);
}

// Chop a path into an array of names
// "/paths/are/just/arrays" => ["paths", "are", "just", "arrays"]
export function chop(path) {
  const segments = normalize(path).match(/[^/]+/g);
  if (!segments) {
    return [];
  } else {
    return segments;
  }
}
