const crypto = require('crypto');
const logger = require('../controllers/logs.controller');
const db = global.db;

exports.renderSignup = (req, res) => {
    res.render("signup", {ip: myIp, baseURL: myIp + ":3000"})
}

exports.addUser = (req, res) => {
    let username = req.body.username;
    let user = db.get('users').find({ username : username }).value();
    if(user === undefined){
      let password = crypto.createHash('md5').update(req.body.password.toString()).digest("hex");
      let cpassword = crypto.createHash('md5').update(req.body.cpassword.toString()).digest("hex");
      let usertoken = crypto.createHash('md5').update(req.body.username.toString() + new Date().toString()).digest("hex");
      if(password === cpassword){
        db.get('users').push({
          username : username,
          password : password,
          role : 0,
          userToken: usertoken,
          loginToken : ""
        }).write()
        let data = {
          nUser : username ,
          msg : "Signed Up"
        }
        logger.log(req, data);
        res.redirect("http://" + myIp + ":3100/login")
      } else {
        res.redirect("http://" + myIp + ":3100/signup?PasswordDoesNotMatch")
      }
    } else {
      res.redirect("http://"+myIp+":3100/signup?UsernameNotAvailable");
    }
}

exports.renderLogin = (req, res) => {
    if(process.argv.includes("signup")){
        res.render("login", {ip: myIp, baseURL: myIp + ":3000", signup : "true"});
    } else {
        res.render("login", {ip: myIp, baseURL: myIp + ":3000", signup : "false"});
    }
}

exports.login = (req, res) => {
    let username = req.body.username;
    let user = db.get('users').find({ username : username }).value();
    // console.log(user)
    if(user === undefined){
      res.redirect("http://"+myIp+":3100/login?InvalidUser");
    } else {//if(!user.loginToken) {
      let currentPassword = crypto.createHash('md5').update(req.body.password.toString()).digest("hex");
      let dbPassword = user.password;
      if(currentPassword === dbPassword){
        let loginToken = crypto.createHash('md5').update((Math.random()).toString() + (new Date()).toString() + req.body.username.toString()).digest("hex");
        let sUserToken = crypto.createHash('md5').update("Im a SuperUser".toString() + req.body.username.toString()).digest("hex");
        db.get('users').find({ username : username }).assign({ loginToken }).write();
        let tempUser = db.get('users').find({ username : username }).value();
        delete tempUser['password']
        let data = {
            username: username,
            user: tempUser,
            loginToken : loginToken,
            msg : "Logged In"
        }
        logger.log(req, data);
        if(tempUser.role === 1) res.cookie('superUser', sUserToken)
        res.cookie('session', loginToken)
        res.redirect("http://"+myIp+":3000/");
      } else {
        let data = {
          msg : "Login Prevented : Invalid Password"
        }
        logger.log(req, data);
        res.redirect("http://"+myIp+":3100/login?InvalidUsernameOrPassword");
      }
    } /*else {
      res.redirect("http://"+myIp+":3100/login?MaximumLoginsReached");
    }*/
}

exports.logout = (req, res) => {
    let referer = req.headers.referer;
    if(get_cookies(req)['session']){
      let loginToken = get_cookies(req)['session']
      res.clearCookie('session');
      let data = {
        loginToken : loginToken,
        msg : "Logged Out"
      }
      logger.log(req, data);
      res.redirect("http://" + myIp + ":3100/login")
    } else {
      res.redirect("http://" + myIp + ":3000/")
    }
}