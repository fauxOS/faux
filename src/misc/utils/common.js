const common = {};

common.genUUID = function() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(char) {
    let r = Math.random() * 16|0, v = char === "x" ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

export default common;