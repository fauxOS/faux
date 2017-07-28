import prompt from "./prompt.js";

export default async function evaluate(str) {
  try {
    const result = self.eval(str);
    const formatted = cli.colorize("green", result);
    await println(formatted);
    return prompt();
  } catch (err) {
    const formatted = cli.colorize("red", err);
    await println(formatted);
    return prompt();
  }
}
