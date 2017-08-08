export default async function prompt(str, color = "gray") {
  const cwd = await sys.cwd();
  const prompt = cli.colorize(color, str || `faux:${cwd} # `);
  return await print(prompt);
}
