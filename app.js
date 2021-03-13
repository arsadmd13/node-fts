const chalk = require("chalk");
const boxen = require("boxen");
var fs = require("fs");
var path = require('path');
let reqPath = path.join(__dirname, '../../');
var os = require('os');
const ejs = require('ejs');
const express = require('express');
const app =  express();
let myIp = ""
let check = 0
const http = require('http');

var ifaces = os.networkInterfaces();

Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      return;
    }
    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      //console.log(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
      //console.log(ifname, iface.address);
      myIp = iface.address
      check = 1
    }
    //++alias;
  });
});

if(myIp === ""){
if(os.platform() !== "android"){
  if(networkInterfaces.hasOwnProperty("en0")){
    let en0 = networkInterfaces.en0;
    en0.forEach(data => {
      if(data.address.startsWith("192.168")){
        myIp = data.address
        check = 1
      }
    })
  }
  else{
    console.log("Connect to a wifi network to turn on local sharing!")
  }
}
else{
  if(networkInterfaces.hasOwnProperty("wlan0")){
    let wlan0 = networkInterfaces.wlan0;
    wlan0.forEach(data => {
      if(data.address.startsWith("192.168")){
        myIp = data.address
        check = 1
      }
    })
  }
  else if(networkInterfaces.hasOwnProperty("wlan1")){
    let wlan1 = networkInterfaces.wlan1;
    wlan1.forEach(data => {
      if(data.address.startsWith("192.168")){
        myIp = data.address
        check = 1
      }
    })
  }
  else{
    console.log("Connect to a wifi network to turn on local sharing!")
  }
}
}

if(check === 1){
  http.createServer(function (request, response) {
    if(request.url !== "/favicon.ico"){
      let referer = request.headers.referer;
      var url = decodeURIComponent(request.url);
      let filePath = path.join(reqPath, url);//"." + request.url;
      console.log(filePath);
      let isPresent = () => {
        try {
          if(fs.existsSync(filePath)) {
            return true;
          } else {
            return false;
          }
        } catch (err) {
          return false;
        }
        return true;
      };
      if ((filePath === './' || isPresent() && fs.lstatSync(filePath).isDirectory()) && request.url !== "/favicon.ico") {
        if(filePath === './'){
          fs.readdir(reqPath , (err, files) => {
            if(err){
              console.log(err);
            }
            if(request.url !== "/"){
              //response.write("<a href='" + referer + "'>" + "Back" + "</a>" + "<br><br>");
            }
            files.forEach(file => {
              if(file.charAt(0) !== '.'){
                if(request.url === "/")
                  response.write("<a href='http://" + myIp +":3000" + request.url + file  + "'>" + file + "</a>" + "<br><br>");
                else
                  response.write("<a href='http://" + myIp +":3000" + request.url + "/" + file  + "'>" + file + "</a>" + "<br><br>");
              }
            })
            response.end();
          })
        }
        else{
          fs.readdir(filePath , (err, files) => {
            if(err){
              console.log(err);
            }
            if(request.url !== "/"){
              //response.write("<a href='" + referer + "'>" + "Back" + "</a>" + "<br><br>");
            }
            files.forEach(file => {
              if(file.charAt(0) !== '.'){
                if(request.url === "/")
                  response.write("<a href='http://" + myIp +":3000" + request.url + file  + "'>" + file + "</a>" + "<br><br>");
                else
                  response.write("<a href='http://" + myIp +":3000" + request.url + "/" + file  + "'>" + file + "</a>" + "<br><br>");
              }
            })
            response.end();
          })
        }
      }
      else{
        var extname = String(path.extname(filePath)).toLowerCase();
        console.log(extname);
        var mimeTypes = {
          '.css': 'text/css',
          '.json': 'application/json',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
          '.wav': 'audio/wav',
          '.mkv': 'video/mkv',
          '.mp4': 'video/mp4',
          '.woff': 'application/font-woff',
          '.ttf': 'application/font-ttf',
          '.eot': 'application/vnd.ms-fontobject',
          '.otf': 'application/font-otf',
          '.wasm': 'application/wasm'
        };
        var contentType = mimeTypes[extname] || 'application/octet-stream';
        fs.readFile(filePath, function(error, content) {
          if (error) {
            if(error.code == 'ENOENT') {
              fs.readFile('./404.html', function(error, content) {
                response.writeHead(404, { 'Content-Type': 'text/html' });
                response.end(content, 'utf-8');
              });
              console.log("Error - ENOENT");
            }
            else if(error.code === "ERR_FS_FILE_TOO_LARGE"){
              response.writeHead(301, {'Location': 'http://' + myIp + ':3100/?filePath=' + filePath});
              response.end();
            }
            else{
              response.end("Error!");
            }
          }
          else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
          }
        });
      }

      response.setHeader('Access-Control-Allow-Origin', '*');
      response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
      response.setHeader('Access-Control-Allow-Credentials', true);
    }
  }).listen(3000);
  console.log('Server is up and running at ' + myIp + ':3000');

  app.get("/", function(req, res){
    res.download(req.query.filePath);
      console.log(req.query.filePath);
  }).listen(3100)

}
else{
  console.log("Connect to any wifi network to share files!");
}

//let reqPath = path.join(__dirname, '../../');
//console.log(reqPath);



/*function checkNetwork(){
  let myIp1 = ""
  let checkNetworkChange = 0
  var networkInterfaces = os.networkInterfaces();
  let en0 = networkInterfaces.en0;
  en0.forEach(data => {
    if(data.address.startsWith("192.168")){
      myIp1 = data.address
      if(myIp !== myIp1){
        //console.log("myIp : " + myIp + " myIp1 : " + myIp1);
        //nodemon.emit('restart')

      }
      //console.log(myIp1);
    }
    //console.log(networkInterfaces);
  })
  if(checkNetworkChange === 1){
      nodemon.emit('restart')
  }
}


setInterval(function(){
  checkNetwork()
}, 10000)*/


/* ***************GETS ALL IP*************** */


/*var interfaces = os.networkInterfaces();

var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}

console.log(addresses);*/
