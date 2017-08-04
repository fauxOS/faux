export function genUUID() {
  const base = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
  return base.replace(/[xy]/g, char => {
    // Random integer between 0 and 16
    const randFloat = Math.random() * 16;
    const randInt = parseInt(randFloat);
    if (char === "x") {
      // "x" is replaced with any hex number
      return randInt.toString(16);
    } else {
      // "y" is replaced with either 8, 9, a, or b
      return ((randInt & 3) | 8).toString(16);
    }
  });
}

export function spawnWorker(script = "") {
  const blob = new Blob([script], { type: "application/javascript" });
  const uri = URL.createObjectURL(blob);
  return new Worker(uri);
}

export function openLocalFile(readAs = "readAsText") {
  const input = document.createElement("input");
  input.type = "file";
  input.click();
  return new Promise(function(resolve, reject) {
    input.onchange = function() {
      const file = input.files[0];
      const reader = new FileReader();
      reader[readAs](file);
      reader.onloadend = function() {
        resolve(reader.result);
      };
    };
  });
}

export function http(uri, method = "GET") {
  return new Promise((resolve, reject) => {
    if (!uri instanceof String) {
      reject("URI invalid");
    }
    const xhr = new XMLHttpRequest();
    xhr.open(method, uri, true);
    xhr.onload = function() {
      if (xhr.status < 300 && xhr.status >= 200) {
        resolve(xhr.response);
      } else {
        reject(xhr.status + " " + xhr.statusText);
      }
    };
    xhr.onerror = function(err) {
      reject(err);
    };
    xhr.send();
  });
}

export function type(value) {
  let ret = typeof value;
  if (ret === "object") {
    if (value === null) {
      ret = "null";
    } else {
      if (value instanceof Array) {
        ret = "array";
      }
    }
  }
  return ret;
}
