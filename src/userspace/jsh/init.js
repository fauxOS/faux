import prompt from "./prompt.js";

export default async function init() {
  // Into raw mode
  // TODO
  // prettier-ignore
  await println(`Welcome to Faux's ${cli.colorize("bold", "J")}avascript ${cli.colorize("bold", "SH")}ell!\n`);
  return await prompt();
}
