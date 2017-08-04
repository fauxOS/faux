import { type } from "./utils.js";

function serializeFunction(value, currentDepth = 0) {
  switch (currentDepth) {
    case 0:
      // Entire function text coerced to a string
      return value + "";
      break;
    case 1:
      if (!value.name) {
        return "[Function]";
      }
      return `[Function: ${value.name}]`;
      break;
    case 2:
    default:
      return "[Function]";
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
        ret[key] = serialize(value[key], depthLimit, currentDepth + 1);
      });
      break;
    case "array":
      ret = [];
      for (let i in value) {
        ret[i] = serialize(value[i], depthLimit, currentDepth + 1);
      }
      break;
    case "function":
      return serializeFunction(value, currentDepth);
      break;
    case "symbol":
      return value.toString();
      break;
    // All other values
    default:
      // Coerce to string
      return value + "";
  }
  // If this is the first call (top level), then return the final string
  if (currentDepth === 0) {
    return JSON.stringify(ret, null, 2);
  } else {
    return ret;
  }
}
