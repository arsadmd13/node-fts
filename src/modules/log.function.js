// const { get_cookies } = require("./cookie.module");

// db = global.db;
// logDb = global.logDb;
// permDb = global.permDb;
// cookies = global.cookies;

// exports.log = (req, data) => {
//     if (req.headers['via']) {
//         clientProxy = req.headers['via'];
//     } else {
//         clientProxy = "none";
//     }
//     let previewTok = get_cookies(req)['preview']
//     if(previewTok === "ed2b5c0139cec8ad2873829dc1117d50"){
//       var previewStatus = "Preview On"
//     } else {
//       var previewStatus = "Preview Off"
//     }
//     let clientAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress
//     let loginToken = data.loginToken || get_cookies(req)['session']
//     let nUser = data.nUser
//     if(loginToken || nUser){
//       if(nUser){
//         logDb.get("logs").push({
//           userID : nUser,
//           ip : clientAddress,
//           proxy : clientProxy,
//           agent: req.headers['user-agent'],
//           referrer: req.headers['referrer'],
//           file : data.file,
//           msg : data.msg,
//           previewStatus : previewStatus,
//           time: new Date()
//         }).write()
//         return
//       }
//       let user = db.get("users").find({loginToken : loginToken}).value()
//       let userID = user.username
//       if(data.msg === "Logged Out")
//         db.get('users').find({loginToken : loginToken}).assign({loginToken: ""}).write()
//       logDb.get("logs").push({
//         userID : userID,
//         ip : clientAddress,
//         proxy : clientProxy,
//         agent: req.headers['user-agent'],
//         referrer: req.headers['referrer'],
//         file : data.file,
//         msg : data.msg,
//         previewStatus : previewStatus,
//         time: new Date()
//       }).write()
//     } else {
//       logDb.get("logs").push({
//         ip : clientAddress,
//         proxy : clientProxy,
//         agent: req.headers['user-agent'],
//         referrer: req.headers['referrer'],
//         file: data.file,
//         msg: data.msg,
//         previewStatus : previewStatus,
//         time: new Date()
//       }).write()
//     }
//   }