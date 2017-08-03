import { type } from "./utils.js";

function inspectFunction(value, currentDepth = 0) {
  switch (currentDepth) {
    case 0:
      // Entire function text coerced to a string
      return value + "";
      break;
    case 1:
      return "[Function]";
      break;
    case 2:
    default:
      return `[Function: ${value.name}]`;
  }
}

export default function serialize(value, depthLimit = 5, currentDepth = 0) {
  if (currentDepth >= depthLimit) {
    return "[...]";
  }
  let ret;
  switch (type(value)) {
    case "object":
      ret = {};
      Object.keys(value).forEach(key => {
        ret[key] = inspect(value[key], depthLimit, currentDepth + 1);
      });
      break;
    case "array":
      ret = [];
      for (let i in value) {
        ret[i] = inspect(value[i], depthLimit, currentDepth + 1);
      }
      break;
    case "function":
      ret = inspectFunction(value, currentDepth);
      break;
    // All other values
    default:
      // Coerce to string
      ret = value + "";
  }
  // If this is the first call (top level), then return the final string
  if (currentDepth === 0) {
    return JSON.stringify(ret, null, 2);
  } else {
    return ret;
  }
}
