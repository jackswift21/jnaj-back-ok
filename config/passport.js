const passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	JwtStrategy = require('passport-jwt').Strategy,
	ExtractJwt = require('passport-jwt').ExtractJwt,
	secret = require('./').secret,
	mongoose = require('mongoose'),
	User = mongoose.model('JNAJ_User');
passport.use('auth-register',new LocalStrategy({
	usernameField:'user[handle]',
	passwordField:'user[pswd]',
	passReqToCallback:true},function(req,handle,pin,done){
	let newUser = req.body.user,role = req.body.user.role,device = req.body.user.device;
	User.findOne({handle:handle})
	.then(existing => existing?
		done(null,false,errors[0]):
		User.create(newUser,done).then(user => done(null,user,{role,device})))
	.catch(err => done(err));}));
passport.use('auth-login',new LocalStrategy({
	usernameField:'user[handle]',
	passwordField:'user[pswd]',
	passReqToCallback:true},function(req,handle,pin,done){
		let role = req.body.user.role,device = req.body.user.device;
		User.findOne({handle:handle})
		.then(user => 
	    !user?done(null,false,errors[1]):
	    !validateAcct(user)?done(null,false,validationErr):
	    !user.validatePin(pin)?done(null,false,errors[2]):
	    user.getProfile(role).then(() => done(null,user,{role,device}))) 
		.catch(err => done(err))})); 
passport.use('auth-tkn-req',new JwtStrategy({
	jwtFromRequest:getTokenFromHeader,
	secretOrKey:secret},function(payload,done){
		let role = payload.role,device = payload.device;
	  User.findOne({handle:payload.handle})
	  .then(user => 
	  	!user?done(null,false,errors[6])://or errors[1]
	  	!validateAcct(user)?done(null,false,validationErr):
	  	user.getProfile(payload.role).then(() => done(null,user,{role,device})))
	  .catch(err => done(err));}));
passport.use('auth-tkn-opt',new JwtStrategy({
	jwtFromRequest:getTokenFromHeader,
	secretOrKey:secret},
  function(payload,done){
  	let role = payload.role||'USER',device = payload.device||'na';
  	User.findOne({handle:payload.handle})
	  .then(user => 
	  	!user?done(null,user,{role:'USER'}):
	  	!validateAcct(user)?done(null,false,validationErr):
	  	user.getProfile(payload.role).then(() => done(null,user,{role,device})))
	  .catch(err => done(err));}));
passport.use('auth-verify',new LocalStrategy({
	usernameField:'user[handle]',
	passwordField:'user[code]',
	passReqToCallback:true},function(req,handle,code,done){
		let role = req.body.user.role,device = req.body.user.device;
		User.findOne({handle:handle})
		.then(user => 
			!user?done(null,false,errors[1]):
			!validateCode(user,code)?done(null,false,validationErr):
			user.getProfile(role).then(() => done(null,user,{role,device})))
		.catch(err => done(err));}));
function getTokenFromHeader(req){
	let auth = req.headers.authorization,
	tkn = auth&&(auth.split(' ')[0] === 'Token'||auth.split(' ')[0] === 'Bearer')?auth.split(' ')[1]:null;
 	return tkn;}
function validateAcct(user){
	validationErr = user.acct.status === 'L'?errors[3]:
	user.acct.status === 'D'?errors[4]:
	user.acct.status === 'X'?errors[5]:{};
	return !validationErr.name;}
function validateCode(user,code){
  user.acct.verified.code === code?
  (() => {user.setAcct('e');user.acct.verified.ts = Date.now()})():
  (validationErr = errors[9]);
  return !validationErr.name;}
let validationErr = {};
const errors = [
	{name:'handle',message:'existing user'},
	{name:'handle',message:'not found'},
	{name:'pin',message:'invalid'},
	{name:'acct',message:'locked'},
	{name:'acct',message:'disabled'},
	{name:'acct',message:'deleted'},
	{name:'token',message:'invalid'},
	{name:'code',message:'invalid regstraton code'}];