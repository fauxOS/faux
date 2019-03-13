import { type } from "./utils.js";

const serialize = (value, depth=0, maxDepth=5) =>
  depth > maxDepth
  ? "[...]"
: value == null
  ? "null"
: value == undefined
  ? "undefined"
: type(value) == "Object"
  ? (() => {
      const ret = Object.keys(value)
        .reduce((acc, key) =>
          Object.assign({}, acc, { [key]: serialize(value[key], depth+1, maxDepth) })
        , {})
      return depth == 0
        ? JSON.stringify(ret, null, 2)
        : ret
    })()
: type(value) == "Array"
  ? (() => {
    const ret = value.map(x => serialize(x, depth+1, maxDepth))
    return depth == 0
      ? JSON.stringify(ret, null, 2)
      : ret
  })()
: value.inspect
  ? value.inpect()
: value.toString
  ? value.toString()
: value.name
  ? value.name
: type(value)

export default serialize;
