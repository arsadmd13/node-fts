exports.get_cookies = function(request) {
    var cookies = {};
    if(request.headers.cookie){
      request.headers && request.headers.cookie.split(';').forEach(function(cookie) {
        var parts = cookie.match(/(.*?)=(.*)$/)
        cookies[ parts[1].trim() ] = (parts[2] || '').trim();
      });
      return cookies;
    } else{
      return "";
    }
  };

exports.clearCookie = (req, res) => {
  if(req.query.id){
    let loginToken = ""
    let user = db.get("users").find({username : req.query.id}).assign({loginToken}).write();
  } else {
    console.log("No user");
  }
}