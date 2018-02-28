const router = require('express').Router(),fs = require('fs');
router.post('/',(req,res,next) => {
  //here(req.body);
  var obj = {
    addr:req.ip||'',
    forwardedFor:req.headers['x-forwarded-for']?req.headers['x-forwarded-for'].split(',').pop():'',
    connRemoteAddr:req.connection.remoteAddress||'',
    sockRemoteAddr:req.socket.remoteAddress||'',
    connSockRemoteAddr:req.connection.socket?(req.connection.socket.remoteAddress||''):''};
  //here(obj);
  res.json({connect:true});});
module.exports = router;