const router = require('express').Router();
router.get('/',function(req,res,next){
  var obj = {};
  obj.title = 'title';
  obj.data = 'data';
  obj.ip = req.ip ||
    (req.headers['x-forwarded-for']?req.headers['x-forwarded-for'].split(',').pop():'')||
    req.connection.remoteAddress ||
    req.socket.remoteAddress||
    req.connection.socket.remoteAddress;
  res.header('Content-type','application/json');
  res.header('Charset','utf8');
  var s = req.query.callback + '('+ JSON.stringify(obj) + ');';
  res.send(s);});
module.exports = router;