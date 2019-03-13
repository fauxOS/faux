import { stat } from "./syscalls.js";
import { readFile } from "./fs/index.js";

async function loadFile(path) {
  // If path is a file
  const pathStat = await stat(path);
  if (pathStat.file) {
    return self.eval(await readFile(path));
  }
  // If path.js is a file
  const pathJsStat = await stat(path + ".js");
  if (pathJsStat.file) {
    return self.eval(await readFile(path + ".js"));
  }
  // If path.json is a file
  const pathJsonStat = await stat(path + ".json");
  if (pathJsonStat.file) {
    return JSON.parse(await readFile(path + ".json"));
  }
  // None worked
  throw new Error("not found");
}

export default requirePath =>
  loadFile(requirePath).catch(_ => loadFile(requirePath + "/index"));
