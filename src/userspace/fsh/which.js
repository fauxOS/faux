export default async function which(name) {
  const toCheck = await sys
    .getenv("PATH")
    .then(PATH => PATH.split(":").map(path => path + "/" + name));
  for (let i in toCheck) {
    const path = toCheck[i];
    try {
      const { file, executable } = await sys.stat(path);
      if (file && executable) {
        return path;
      }
    } catch (e) {}
  }
}
