import prompt from "./prompt.js";
import serialize from "../../misc/serialize.js";
import { Ok, Err } from "../../misc/fp.js";

export const runSafe = jsCodeString => {
  let result;
  try {
    result = Ok(self.eval(jsCodeString))
  }
  catch(e) {
    result = Err(e);
  }
  return result;
}

export default str =>
  runSafe(str)
    .map(serialize)
    .fold(e => cli.colorize("red",   e))
         (r => cli.colorize("green", r))
