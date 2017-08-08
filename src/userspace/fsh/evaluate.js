import prompt from "./prompt.js";
import parse from "./parser.js";
import which from "./which.js";

export default async function evaluate(str) {
  const ast = parse(str);
  for (let i in ast.commands) {
    const command = ast.commands[i];
    const execPath = await which(command.name);
    // Actually run the program
    sys.exec(execPath, command.argv);
  }
  return await prompt();
}
