import prompt from "./prompt.js";

export default async function init() {
  // prettier-ignore
  await println(`Welcome to Faux's J${cli.colorize("dim", "avascript")} SH${cli.colorize("dim", "ell")}!\n`);
  return prompt();
}
