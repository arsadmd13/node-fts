//showMyFiles
const path = require('path');
let reqPath = path.join(__dirname, '../../../../')
const { get_cookies } = require("./cookies.controller");
const { getExtension } = require("./misc.controller");
var fs = require('fs');
const db = global.db;

exports.renderShowMyFiles = (req, res) => {
    let udb = db.get('users').find({loginToken: get_cookies(req)['session']}).value();
    let userPermDb = permDb.get('users').find({username: udb.username}).value();
    var files = userPermDb.files.split(",")
    let filePath = path.join(reqPath, '');//"." + request.url;
    var data = new Object()
    var count = 0
    for(var i = 0; i < files.length; i++){
      var file = files[i].split('/')
      if(fs.lstatSync(reqPath + "/" + files[i]).isDirectory()){
        data["isDir" + i] = "true"
      } else{
        data["isDir" + i] = "false"
        //var extname = String(path.extname(filePath + '/' + file)).toLowerCase()
        var extname = getExtension(reqPath + '/' + files[i])
        data["ext" + i] = extname
        console.log("bb"+extname);
      }
      data['key'+i] = file[file.length-1];
      delete file[file.length-1]
      data['rurl'+i] = ""
      for(var j=0;j<file.length-1;j++){
        data['rurl'+i] += file[j]
      }

      count = i;
    }
    var viewTok = get_cookies(req)['view'];
    if(viewTok === "baec6461b0d69dde1b861aefbe375d8a"){
      var currentView = "icon"
      var nView = 1;
    } else {
      var currentView = "list"
      var nView = 0;
    }
    var previewTok = get_cookies(req)['preview'];
    if(previewTok === "ed2b5c0139cec8ad2873829dc1117d50"){
      var previewStatus = "on"
    } else {
      var previewStatus = "off"
    }
    var vpath = filePath.replace(reqPath, 'Home/').split('/')
    console.log(data);
    res.render("private", {success: "Success", data: [data], count: count, path:vpath, ip: myIp, baseURL: myIp+":3000",  view: currentView, nView: nView, preview: previewStatus, loggedIn : "true"})
}

exports.showMyFiles = (req, res) => {
    let filePath = path.join(reqPath, req.body.file);//"." + request.url;
    var vpath = filePath.replace(reqPath, 'Home/').split('/')
    var dataObj = new Object();
    var tcount = 0;
    fs.readdir(filePath , (err, files) => {
      if(err){
        console.log(err);
      }
      files.forEach(file => {
        if(file.charAt(0) !== '.'){
          var key = "key" + tcount;
          var rurl = "rurl" + tcount;
          var isDir = "isDir" + tcount;
          var ext = "ext" + tcount;
          dataObj[key] = file;
          if(fs.lstatSync(filePath + "/" + file).isDirectory()){
            dataObj[isDir] = "true"
          } else{
            dataObj[isDir] = "false"
            var extname = getExtension(filePath + '/' + file)
            dataObj[ext] = extname
          }
          dataObj[rurl] =  req.body.file
          tcount++;
        }
      })
      var viewTok = get_cookies(req)['view'];
      if(viewTok === "baec6461b0d69dde1b861aefbe375d8a"){
        var currentView = "icon"
        var nView = 1;
      } else {
        var currentView = "list"
        var nView = 0;
      }
      var previewTok = get_cookies(req)['preview'];
      if(previewTok === "ed2b5c0139cec8ad2873829dc1117d50"){
        var previewStatus = "on"
      } else {
        var previewStatus = "off"
      }
      console.log(dataObj);
      res.render("private", {success: "Success", data: [dataObj], count: tcount, ip: myIp, baseURL: myIp+":3000", path: vpath, view: currentView, nView: nView, preview: previewStatus, loggedIn : "true"})
    })
}