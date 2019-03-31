import parse from "./parser.js";
import which from "./which.js";

// prettier-ignore
export default str =>
  parse(str).commands
    .map(command =>
      which(command.name)
        .then(execPath => sys.exec(execPath, command.argv))
        .catch(console.warn));
