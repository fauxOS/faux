import prompt from "./prompt.js";

export default async function init() {
  await println("Welcome to Faux's Javascript SHell!\n");
  return prompt();
}
