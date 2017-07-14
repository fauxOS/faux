async function loadFile(path) {
  // If path is a file
  const pathStat = await sys.stat(path);
  if (pathStat.file) {
    return self.eval(await fs.readFile(path));
  }
  // If path.js is a file
  const pathJsStat = await sys.stat(path + ".js");
  if (pathJsStat.file) {
    return self.eval(await fs.readFile(path + ".js"));
  }
  // If path.json is a file
  const pathJsonStat = await sys.stat(path + ".json");
  if (pathJsonStat.file) {
    return JSON.parse(await fs.readFile(path + ".json"));
  }
  // None worked
  throw new Error("not found");
}

// This eval's in global webworker context and returns what eval returns
export default async function load(requirePath = "") {
  if (typeof requirePath !== "string") {
    throw new Error("argument is not a string");
  }
  // Try loading as a file
  try {
    return loadFile(requirePath);
  } catch (err) {
    // If it fails, try to load an index file
    return loadFile(requirePath + "/index");
  }
}
