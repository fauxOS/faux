import prompt from "./prompt.js";

export default async function init() {
  // Into raw mode
  // TODO
  // prettier-ignore
  await println(`Welcome to Faux's J${cli.colorize("gray", "avascript")} SH${cli.colorize("gray", "ell")}!\n`);
  return await prompt();
}
