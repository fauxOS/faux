import prompt from "./prompt.js";
import parse from "./parser.js";
import which from "./which.js";

// prettier-ignore
export default str =>
  parse(str).commands
    .map(command =>
      which(command.name)
        .then(execPath => sys.exec(execPath, command.argv))
        .then(() => prompt())
        .catch(console.warn));
