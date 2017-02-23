var http = require('http'),
    https = require('https'),
    fs = require('fs');

var http_port = 80,
    https_port = 443;

var options = {
  key: fs.readFileSync('***********************************'),
  cert: fs.readFileSync('***********************************')
}

https.createServer(options, function (req,res) {
  var url = req.url;
  console.log(url);
  if (url != "/favicon.ico") {
    var info = {};
    switch (req.url){
      case "/":
        info["file"] = "./index.html";
        info["type"] = "text/html";
        break;
      case "/lib/Detector.js":
        info["file"] = "./lib/Detector.js";
        info["type"] = "text/javascript";
        break;
      case "/lib/lib.js":
        info["file"] = "./lib/lib.js";
        info["type"] = "text/javascript";
        break;
      case "/src/test.js":
        info["file"] = "./src/test.js";
        info["type"] = "text/javascript";
        break;
      case "/fonts/gentilis_regular.typeface.json":
        info["file"] = "./fonts/gentilis_regular.typeface.json";
        info["type"] = "application/json";
        break;
      case "/lib/clmtrackr.min.js":
        info["file"] = "./lib/clmtrackr.min.js";
        info["type"] = "text/javascript";
        break;
      case "/lib/model_pca_20_svm.js":
        info["file"] = "./lib/model_pca_20_svm.js";
        info["type"] = "text/javascript";
        break;
    }
    fs.readFile(info.file, 'utf-8', function(err, data) {
      res.writeHead(200, {'Content-Type': info.type});
      res.write(data);
      res.end();
    });
  }
}).listen(https_port);

http.createServer(function (req,res) {
  var url = req.url;
  console.log(url);
  if (url != "/favicon.ico") {
    var info = {};
    switch (req.url){
      case "/":
        info["file"] = "./index.html";
        info["type"] = "text/html";
        break;
      case "/lib/Detector.js":
        info["file"] = "./lib/Detector.js";
        info["type"] = "text/javascript";
        break;
      case "/lib/lib.js":
        info["file"] = "./lib/lib.js";
        info["type"] = "text/javascript";
        break;
      case "/src/test.js":
        info["file"] = "./src/test.js";
        info["type"] = "text/javascript";
        break;
      case "/fonts/gentilis_regular.typeface.json":
        info["file"] = "./fonts/gentilis_regular.typeface.json";
        info["type"] = "application/json";
        break;
      case "/lib/clmtrackr.min.js":
        info["file"] = "./lib/clmtrackr.min.js";
        info["type"] = "text/javascript";
        break;
      case "/lib/model_pca_20_svm.js":
        info["file"] = "./lib/model_pca_20_svm.js";
        info["type"] = "text/javascript";
        break;
    }
    fs.readFile(info.file, 'utf-8', function(err, data) {
      res.writeHead(200, {'Content-Type': info.type});
      res.write(data);
      res.end();
    });
  }
}).listen(http_port);

console.log('server listening ...');
