require('./here');
//require('./models');
require('./config/passport');
var profiles = require('./data/profiles');
//require('./sockets')(io);
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
	config = require('./config'),
  mailer = require('./my-mailer')
  //require('./config/passport');
  jnaj_connect = require('./jnaj-connect').connect,
  isProd = process.env.NODE_ENV === 'production',
  PORT = config.port,
  DB = config.db,
  app = express();
app
  .use(cors())
  .use(require('morgan')('dev'))
  .use(bodyParser.urlencoded({extended:true}))
  .use(bodyParser.json())
  .use(require('method-override')())
  //.use(express.static(path.join(__dirname,'public')))
  .use('/uploads',express.static(__dirname +'/uploads'))
  .set('views', path.join(__dirname,'views'))
  .set('view engine','ejs')
  .use(session({secret:'tacos_or_bust',cookie:{maxAge:60000},resave:false,saveUninitialized:false}))
if(!isProd){
  app.use(errorhandler());
  mongoose.connect(DB,e => e?here(e):here('JNAJ_MongoDB on the cloud...'))
  mongoose.set('debug',false);}
else{mongoose.connect(process.env.MONGODB_URI);}
app
  .get('/',(req,res) => res.render('home'))
  .post('/connect',jnaj_connect,(req,res) => res.json({connect:true}))
  .get('/profiles',(req,res) => res.json({profiles:profiles}))
  .post('/contact',
    (req,res,next) => {
      mailer.send({
        _from:'JNAJ <jackneedsajob01@gmail.com>',
        _to:'Jack <jack1.fu.dz@gmail.com>',
        _subject:req.body.subject,
        _html:
          '<p>Visitor Name: '+req.body.name+'</p>'+
          '<p>Visitor Email: '+req.body.email+'</p>'+
          '<p>Visitor Message: '+req.body.message+'</p>'})
      .then(msg => {req.confirmMsg = msg;next()});},
    (req,res) => {
      here(req.confirmMsg);
      res.json({confirm:req.confirm})})
  .post('/apiError',
    (req,res,next) => {here(req.body.apiError);next()},
    (req,res) => res.json({errReceived:true}))
  //.use(require('./routes'))
  .use((req,res,next) => {
    var err = new Error('Not Found');
    err.status = 404;
    res.render('not-found',err);})
  .use((err,req,res,next) => {
    if(!isProd) here(err.stack);
    res.status(err.status||500).json({name:!isProd?err:{},message:err.message});})
  .set('port',PORT)
  .listen(PORT,() => here(`JNAJ_Api listening on ${ PORT }...`));