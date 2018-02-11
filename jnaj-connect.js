exports.connect = function jnaj_connect(req,res,next){
	//var fs = require('fs'),
	obj = {
  	addr:req.ip||'',
  	forwardedFor:req.headers['x-forwarded-for']?req.headers['x-forwarded-for'].split(',').pop():'',
  	connRemoteAddr:req.connection.remoteAddress||'',
  	sockRemoteAddr:req.socket.remoteAddress||'',
  	connSockRemoteAddr:req.connection.socket?(req.connection.socket.remoteAddress||''):''};
  here(req.body);
  next();
  //fs.appendFile('quick-log.txt',JSON.stringify(obj)+'@'+(new Date().toUTCString())+'\n',e => {
  	//e?console.log('absolutely not'):
  	//(() => {req.ip_obj = obj;next();})();});
  }

//exports.connect = jnaj_connect;

//res.header('Content-type','application/json');
//res.header('Charset','utf8');
//var s = req.query.callback + '('+ JSON.stringify(obj) + ');';
//res.send(s);

/*<script type="application/javascript">
    function getConnection(ip){
      window.localStorage.setItem('ip',JSON.stringify(ip));
      console.log("user connected",JSON.stringify(ip));}</script>
<script type="application/javascript" src="/connect?callback=getConnection"></script>*/