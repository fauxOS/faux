import prompt from "./prompt.js";
import serialize from "../../misc/serialize.js";

export default async function evaluate(str) {
  let formatted = "";
  try {
    // Raw result from eval()
    const result = self.eval(str);
    // Serialized (to string) output
    const serialized = serialize(await result);
    formatted = `\n${cli.colorize("green", serialized)}`;
    // Resolve promises so that we don't just print the returned promise itself"
    if (result instanceof Promise) {
      formatted = `\n[object Promise] -> ${cli.colorize("green", serialized)}`;
    }
  } catch (err) {
    formatted = `\n${cli.colorize("red", err)}`;
  }
  await println(formatted);
  return await prompt();
}
