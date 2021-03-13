const crypto = require('crypto');
const logger = require('../controllers/logs.controller');
const path = require('path');
let reqPath = path.join(__dirname, '../../../../');

exports.escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* Define functin to find and replace specified term with replacement string */
exports.replaceAll = (str, term, replacement) => {
  return str.replace(new RegExp(escapeRegExp(term), 'g'), replacement);
}
exports.is_dir = (path) => {
    try {
        var stat = fs.lstatSync(path);
        return stat.isDirectory();
    } catch (e) {
        // lstatSync throws an error if path doesn't exist
        return false;
    }
}

exports.logFiles = (path) => {
    if(fs.lstatSync(path).isDirectory()){
        //if((path !== "/Users/mohamedarsad/System" || path !== "/Users/mohamedarsad/System/") &&  (path !== "/Users/mohamedarsad/Library" || path !== "/Users/mohamedarsad/Library/") && (path !== "/Users/mohamedarsad/Applications" || path !== "/Users/mohamedarsad/Applications/")){
        if(path !== "/Users/mohamedarsad/Library" && path !== "/Users/mohamedarsad/Pictures/Photo Booth Library" && path !== "/Users/mohamedarsad/Pictures/Photos Library.photoslibrary"){
            console.log(path);
            fs.readdir(path , (err, files) => {
                if(err){ console.log(err); }
                files.forEach(file => {
                    if(file.charAt(0) !== '.'){
                        if(path.charAt(path.length -1 ) !== "/")
                        logFiles(path + "/" + file)
                        else
                        logFiles(path + file)
                    }
                })
            })
        }
    } else {
        fileDb.get("files").push({
            file : path
        }).write()
          //console.log(path);
    }

}

exports.getClientAddress = (req) => {
    return (req.headers['x-forwarded-for'] || '').split(',')[0]
        || req.connection.remoteAddress;
}

exports.getExtension = (filename) => {
    var i = filename.lastIndexOf('.');
    return (i < 0) ? '' : filename.substr(i).toLowerCase();
}

exports.getSubDir = (req, res) => {
    var currentFilePath = reqPath + req.body.folder
    console.log(currentFilePath);
    let data = new Object()
    let count = 0;
    fs.readdir(currentFilePath , (err, files) => {
      if(err){
        console.log(err);
      }
      files.forEach(file => {
        if(!file.startsWith('.'))
        if(fs.lstatSync(currentFilePath + "/" + file).isDirectory()){
          var key = "key" + count;
          var rurl = "rurl" + count;
          var isDir = "isDir" + count;
          var ext = "ext" + count;
          data[key] = file;
          data[rurl] = req.body.folder
          data[isDir] = "true"
          count++
        }
      })
      res.json({data: [data], count: count})
    })
}

exports.preview = (req, res) => {
     //console.log(req.query.file);
     var file = req.query.file.replace('/Home/', reqPath)
     //console.log(file);
     res.sendFile(file)
}

exports.changePreview = (req, res) => {
    let referer = req.headers.referer;
    res.clearCookie('preview');
    let cookieToken = crypto.createHash('md5').update(req.body.preview).digest("hex");
    //console.log(cookieToken);
    res.cookie('preview', cookieToken)
    res.redirect(referer)
}


exports.changeView = (req, res) => {
    let referer = "" + req.headers.referer;
    res.clearCookie('view');
    let cookieToken = crypto.createHash('md5').update(req.body.view).digest("hex");
    res.cookie('view', cookieToken)
    res.redirect(referer)
}

exports.assets = (req, res) => {
    res.sendFile(__dirname + '/public/' + req.query.loc)
}
//app.get("/")
exports.download = (req, res) => {
    if(req.query['pt'] === 'tr'){
        console.log("ssss");
        let file = req.query.filePath;
        file = file.replace('/', '/Users/mohamedarsad/')
        res.download(file);
        // res.download(req.query.filePath);
    } else {
        res.download(req.query.filePath);
    }
}