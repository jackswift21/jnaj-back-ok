require('./here');
//require('./models');
const express = require('express');
  path = require('path'),
	fs = require('fs'),
	errorhandler = require('errorhandler'),
	mongoose = require('mongoose'),
  methods = require('methods'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  cors = require('cors'),
  multer = require('multer'),
  passport = require('passport'),
  mailer = require('nodemailer'),
  io = require('socket.io'),
  //sock = require('./sockets')(io)
	//config = require('./config'),
  //require('./config/passport');
  jnaj_connect = require('./jnaj-connect').connect,
  isProd = process.env.NODE_ENV === 'production',
  PORT = process.env.PORT || 3000,
  DB = process.env.MONGODB_URI || "mongodb://js21_admin0_db:l0ne21star20!db"+
    "@cluster0-shard-00-00-kqjd9.mongodb.net:27017,"+
    "cluster0-shard-00-01-kqjd9.mongodb.net:27017,"+
    "cluster0-shard-00-02-kqjd9.mongodb.net:27017/test?"+
    "ssl=true&replicaSet=Cluster0-shard-0&authSource=admin";
express()
  .use(cors())
  .use(require('morgan')('dev'))
  .use(bodyParser.urlencoded({extended:true}))
  .use(bodyParser.json())
  .use(require('method-override')())
  .use(errorhandler())
  .use('/uploads',express.static(__dirname +'/uploads'))
  .use(session({secret:'tacos_or_bust',cookie:{maxAge:60000},resave:false,saveUninitialized:false}))
  .use(express.static(path.join(__dirname,'public')))
  .set('views', path.join(__dirname,'views'))
  .set('view engine','ejs')
  .get('/',(req,res) => res.render('intro'))
  .get('/main',(req,res) => res.render('main'))
  .get('/search',(req,res) => res.render('search'))
  .post('/search',(req,res) => {
    here(req.body);
    res.json({frameworks:req.body.frameworks,urgency:req.body.urgency})})
  .get('/about',(req,res) => res.render('about'))
  .get('/profiles',(req,res) => res.render('team'))
  .get('/samples',(req,res) => res.render('portfolio'))
  .get('/simon',(req,res) => res.render('simon'))
  .get('/pricing',(req,res) => res.render('pricing'))
  .get('/contact',(req,res) => res.render('contact'))
  .get('/aboutJack',(req,res) => res.render('bio'))
  //.get('/ad',(req,res) => res.render('ad'))
  //.get('/articles',(req,res) => res.render('articles'))
  //.get('/hireMe',(req,res) => res.render('hireme'))
  /*.post('/hireMe',(req,res) => res.json({
    recruiter:req.body.recruiterName,
    frontEnd:req.body.frontEnd,
    urgency:req.body.urgency}))*/
  //.get('/ad',(req,res) => res.render('ad'))
  //.get('/simon',(req,res) => res.render('simon',{results:require('./leaders').leader}))
  .post('/connect',jnaj_connect,(req,res) => res.json({connect:true}))
  //.use(require('./routes'));
  .use((req,res,next) => {
    var err = new Error('Not Found');
    err.status = 404;
    res.render('not-found',err);})
  .use((err,req,res,next) => {
    if(!isProd) here(err.stack);
    res.status(err.status||500).json({name:!isProd?err:{},message:err.message});})
  .set('port',PORT)
  .listen(PORT,() => here(`JNAJ_Api listening on ${ PORT }...`));
if(!isProd) mongoose.set('debug',false);
mongoose.connect(DB,e => e?here(e):here('JNAJ_MongoDB on the cloud...'));

/*function handle_inc_req(req,res){
  req._url = url.parse(req.url,true);
  //let core_url = req._url.pathname;
  here('Incoming request: '+req.method+' '+req._url.pathname);
  res.writeHead(200,{'Content-Type':'application/json'})
  res.end(JSON.stringify({error:null}) + '\n');}
  //if(isMethod(req,'get')&&core_url == '/albums.json') handle_list_albums(req,res);
  //else if(isMethod(req,'post')&&searchUrl(core_url,12,'/rename.json')) handle_rename_album(req,res);
  //else if(isMethod(req,'get')&&searchUrl(core_url,[0,7],'/albums')&&searchUrl(core_url,5,'.json')) handle_get_album(req,res);
  //else send_failure(res,404,invalid_resource());*/