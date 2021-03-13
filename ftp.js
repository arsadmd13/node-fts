#!/usr/bin/env node

var http = require('http');
var fs = require('fs');
var path = require('path');
let reqPath = path.join(__dirname, '../../');
var os = require('os');
const ejs = require('ejs');
const express = require('express');
const qs = require('querystring');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(path.join(__dirname, 'database', 'db.json'));
const logadapter = new FileSync(path.join(__dirname, 'database', 'logs.json'));
const db = low(adapter);
const logDb = low(logadapter);
const app =  express();
let myIp = "";
let check = 0;
var ifaces = os.networkInterfaces();
const logger = require('./src/controllers/logs.controller');//'./src/modules/log.function');
const { get_cookies } = require('./src/controllers/cookies.controller')//"./src/modules/cookie.module");

global.db = db;
global.logDb = logDb;
global.get_cookies = get_cookies;
global.myIp = myIp;

checkPreReq()

http.createServer(function (request, response) {
  setHeaders(request, response);
  checkLogin(request, response);
  if(request.url !== "/favicon.ico"){
    var url = decodeURIComponent(request.url).replace('/Home', '');
    let filePath = path.join(reqPath, url);//"." + request.url;
    let referer = request.headers.referer;
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
          files.forEach(file => {
            if(file.charAt(0) !== '.'){
              if(request.url === "/")
                ejs.render("./public/index.ejs", {success: "Success"});
              else
                response.render("./public/index.ejs", {success: "Success"});
            }
          })
          response.end();
        })
      }
      else{
        var dataObj = new Object();
        var count = 0;
        fs.readdir(filePath , (err, files) => {
          if(err){
            console.log(err);
          }
          files.forEach(file => {
            if(file.charAt(0) !== '.'){
              var key = "key" + count;
              var rurl = "rurl" + count;
              var crurl = "crurl" + count;
              var isDir = "isDir" + count;
              var ext = "ext" + count;
              if(request.url === "/") {
                dataObj[key] = file;
                dataObj[rurl] = ""
                if(fs.lstatSync(filePath + "/" + file).isDirectory()){
                  dataObj[isDir] = "true"
                } else{
                  dataObj[isDir] = "false"
                  var extname = getExtension(filePath + '/' + file)

                  dataObj[ext] = extname
                }
                dataObj[crurl] = ""
              } else {
                dataObj[key] = file;
                dataObj[rurl] = request.url
                if(fs.lstatSync(filePath + "/" + file).isDirectory()){
                  dataObj[isDir] = "true"
                } else{
                  dataObj[isDir] = "false"
                  var extname = getExtension(filePath + '/' + file)
                  dataObj[ext] = extname
                  console.log(extname);
                }
                // var mykey = crypto.createCipher('aes-128-cbc', 'thisisfilepathkey', 'keykeykey');
                // var encrypted = mykey.update(request.url, 'utf8', 'hex')
                // encrypted += mykey.final('hex');
                // dataObj[crurl] = encrypted;
              }
              count++;
            }
          })
          if(request.url){
            var path = filePath.replace(reqPath, 'Home/').split('/')
          } else {
            var path = filePath.replace(reqPath, 'Home/').split('/')
          }
          var viewTok = get_cookies(request)['view'];
          if(viewTok === "baec6461b0d69dde1b861aefbe375d8a"){
            var currentView = "icon"
            var nView = 1;
          } else {
            var currentView = "list"
            var nView = 0;
          }
          var previewTok = get_cookies(request)['preview'];
          if(previewTok === "ed2b5c0139cec8ad2873829dc1117d50"){
            var previewStatus = "on"
          } else {
            var previewStatus = "off"
          }
          if(get_cookies(request)['session']){
            if(get_cookies(request)['superUser'] === "95edf22a9143bc59e840d7d6145fc670"){
              var superUser = "true"
            } else {
              var superUser = "false"
            }
            var loggedIn = "true";
            let user = db.get("users").find({loginToken : get_cookies(request)['session']}).value()
            if(user !== undefined) var userID = user.username
          } else {
            var loggedIn = "false"
            var userID = ""
          }
          var htmlContent = fs.readFileSync(__dirname + '/views/index.ejs', 'utf8');
          var htmlRenderized = ejs.render(htmlContent, {success: "Success", superUser: superUser, data : [dataObj], count: count, ip: myIp, baseURL: myIp+":3000", path: path, fpath: url, view: currentView, nView: nView, preview: previewStatus, loggedIn : loggedIn, userID: userID});
          response.write(htmlRenderized)
          response.end()
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
            response.writeHead(302, {'Location': 'http://' + myIp + ':3100/download?filePath=' + filePath});
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
  }
}).listen(3000);
  
console.log('Server is up and running at ' + myIp + ':3000');


app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({extended : true}))
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

require('./src/routes/auth.routes')(app)
require('./src/routes/log.routes')(app)
require('./src/routes/misc.routes')(app)
require('./src/routes/app.routes')(app)
require('./src/routes/share-files.route')(app)

app.get('/assets', (req, res) => {
  res.sendFile(__dirname + '/public/' + req.query.loc)
})

app.listen(3100)

function getExtension(filename) {
    var i = filename.lastIndexOf('.');
    return (i < 0) ? '' : filename.substr(i).toLowerCase();
}

function checkLogin(req, res){
  var url = decodeURIComponent(req.url).replace('/Home', '');
  let filePath = path.join(reqPath, url);//"." + request.url;
  if(process.argv.includes("reqLogin")){
    var loginToken = get_cookies(req)['session'];
    if(!loginToken){
      let data = {
        file : filePath,
        msg : "Denied access for authentication!"
      }
      logger.log(req, data);
      res.writeHead(302, {'Location' : 'http://' + myIp + ':3100/login'});
    } else {
      let user = db.get("users").find({loginToken : loginToken}).value()
      if(user === undefined){
        res.writeHead(302, {'Location' : 'http://' + myIp + ':3100/login'});
      } else {
        let data = {
          file : filePath,
          msg : "File Accessed"
        }
        logger.log(req, data);
      }
    }
  } else {
    let data = {
      file : filePath,
      msg : "File Accessed"
    }
    logger.log(req, data);
  }
}

function setHeaders(req, res){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Cache-Control', "no-store, no-cache");
}

function escapeRegExp(string){
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceAll(str, term, replacement) {
  return str.replace(new RegExp(escapeRegExp(term), 'g'), replacement);
}

async function checkPreReq() {
  if(os.platform() === "darwin"){
    if(ifaces.hasOwnProperty("en0")){
      let en0 = ifaces.en0;
      en0.forEach(data => {
        if(data.family === "IPv4"){
          myIp = data.address
          check = 1
        }
      })
    }
    else{
      console.log("Connect to a wifi network to turn on local sharing!")
    }
  } else if(os.platform() === "win32" || os.platform() === "win64" ) {
    if(ifaces.hasOwnProperty("Wi-Fi")){
      let wiFi = ifaces['Wi-Fi']
      let addresses = [];
      wiFi.forEach((data) => {
        if(data.family === "IPv4") {
          addresses.push(data.address)
        }
      })
      if(addresses.length > 0) {
        myIp = addresses[0]
        check = 1
      }
    }
  } else if(os.platform() === "android"){
    if(ifaces.hasOwnProperty("wlan0")){
      let wlan0 = ifaces.wlan0;
      wlan0.forEach(data => {
        if(data.address.startsWith("192.168")){
          myIp = data.address
          check = 1
        }
      })
    }
    else if(ifaces.hasOwnProperty("wlan1")){
      let wlan1 = ifaces.wlan1;
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
  } else {
    console.log("Sorry, We don't support your os yet!.")
  }

  if(check === 0) {
    myIp = "127.0.0.1";
  }
  global.myIp = myIp;
}