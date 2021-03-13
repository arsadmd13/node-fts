const { get_cookies } = require("./cookies.controller");
const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(path.join(__dirname, '../../database', 'db.json'));
const db = low(adapter);
const logadapter = new FileSync(path.join(__dirname, '../../database', 'logs.json'))
const logDb = low(logadapter);

exports.log = (req, data) => {
    // const logDb = global.logDb;
    if (req.headers['via']) {
        clientProxy = req.headers['via'];
    } else {
        clientProxy = "none";
    }
    let previewTok = get_cookies(req)['preview']
    if(previewTok === "ed2b5c0139cec8ad2873829dc1117d50"){
      var previewStatus = "Preview On"
    } else {
      var previewStatus = "Preview Off"
    }
    let clientAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    let loginToken = data.loginToken || get_cookies(req)['session']
    let nUser = data.nUser
    if(loginToken || nUser){
      if(nUser){
        logDb.get("logs").push({
          userID : nUser,
          ip : clientAddress,
          proxy : clientProxy,
          agent: req.headers['user-agent'],
          referrer: req.headers['referrer'],
          file : data.file,
          msg : data.msg,
          previewStatus : previewStatus,
          time: new Date()
        }).write()
        return
      }
      let user = db.get('users').find({ loginToken }).value() || {};
      if(data.msg === "Logged In") {
        user = data.user
      }
      let userID = user.username || "NA"
      if(data.msg === "Logged Out")
        db.get('users').find({loginToken : loginToken}).assign({loginToken: ""}).write()
      // console.log(logDb.get("logs"))
      logDb.get("logs").push({
        userID : userID,
        ip : clientAddress,
        proxy : clientProxy,
        agent: req.headers['user-agent'],
        referrer: req.headers['referrer'],
        file : data.file,
        msg : data.msg,
        previewStatus : previewStatus,
        time: new Date()
      }).write();
    } else {
      logDb.get("logs").push({
        ip : clientAddress,
        proxy : clientProxy,
        agent: req.headers['user-agent'],
        referrer: req.headers['referrer'],
        file: data.file,
        msg: data.msg,
        previewStatus : previewStatus,
        time: new Date()
      }).write();
    }
}

exports.getLog = (req, res) => {
  var data = new Object();
    var logs = new Object();
    var logCount = new Object();
    let obj = db.get('users').chain().filter("username").value()
    var count = 0;
    for(var i = 0; i < obj.length; i++){
      if(obj[i].username !== "admin"){
        var key = "user" + count;
        data[key] = obj[i].username
        var logData = logDb.get('logs').filter({userID : obj[i].username}).value()
        var user = obj[i].username
        logs[user] = {}
        for(var j = 0; j < logData.length; j++){
          var logKey = "log" + j;
          logs[user][logKey] = logData[j]
        }
        logCount[user] = logData.length
        count++
      }
    }
    if(get_cookies(req)['superUser']){
      var superUser = "true"
    } else {
      var superUser = "false"
    }
    res.render("logs", {superUser: superUser, ip: myIp, baseURL: myIp + ":3000", data : [data], totUsers: count, logData: logs, logCount: logCount, loggedIn: "true"})
}