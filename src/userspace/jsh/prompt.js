export default async function prompt(str = "jsh> ", color = "gray") {
  const prompt = cli.colorize(color, str);
  return await print(prompt);
}
