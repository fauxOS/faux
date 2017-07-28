export default async function prompt(str = "jsh> ", color = "green") {
  const prompt = cli.colorize(color, str);
  return print(prompt);
}
