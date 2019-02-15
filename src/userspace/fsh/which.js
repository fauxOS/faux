export default async function which(name) {
  const path = (await sys.getenv("PATH")).split(":");
  for (let i in path) {
    const execPath = path[i] + "/" + name;
    const pathStat = await sys.stat(execPath);
    if (pathStat.file && pathStat.executable) {
      return execPath;
    }
  }
}
