const browser = {};

browser.mkWorker = function(scriptStr) {
  const blob = new Blob(
    [scriptStr],
    {type: "application/javascript"}
  );
  const uri = URL.createObjectURL(blob);
  return new Worker(uri);
}

browser.openLocalFile = function(readAs="readAsText") {
  const input = document.createElement("input");
  input.type = "file";
  input.click();
  return new Promise(function(resolve, reject) {
    input.onchange = function() {
      const file = input.files[0];
      const reader = new FileReader();
      reader[readAs](file);
      reader.onloadend = function() {
        resolve( reader.result );
      };
    };
  });
}

browser.http = function(uri, method = "GET") {
  return new Promise((resolve, reject) => {
    if (! uri instanceof String) {
      reject("URI invalid");
    }
    const xhr = new XMLHttpRequest();
    xhr.open(method, uri, true);
    xhr.onload = function() {
      if (xhr.status < 300 && xhr.status >= 200) {
        resolve(xhr.response);
      }
      else {
        reject(xhr.status + " " + xhr.statusText);
      }
    };
    xhr.onerror = function(err) {
      reject(err);
    }
    xhr.send();
  });
}

export default browser;