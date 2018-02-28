const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  uniqueValidator = require('mongoose-unique-validator');
  crypto = require('crypto'),
  jwt = require('jsonwebtoken'),
  slug = require('slug'),
  secret = require('../config').secret;
  User = require('./UserProfile.model'),
  Recruiter = require('./RecruiterProfile.model');
var user = new Schema({
  name:{//name
    f:{//first
      type:String,
      required:[true,"can't be blank"],
      match: [/^[a-zA-Z]+$/,'is invalid']},
    l:{//last
      type:String,
      required:[true,"can't be blank"],
      match:[/^[a-zA-Z]+$/,'is invalid']}},
  handle:{
    type: String,
    //lowercase: true,
    unique: true,
    required:[true,"can't be blank"],
    match: [/^[a-zA-Z0-9]+$/,'is invalid'],
    index: true},
  email:{
    type: String,
    lowercase:true,
    unique:true,
    required:[true, "can't be blank"],
    match: [/\S+@\S+\.\S+/, 'is invalid']},
  acct:{
    v:{//verified
      c:String,//code
      s:String,//status/signature
      t:Date},//time
    s:{type:String,enum:['N','L','E','D','X']},//status-new,locked,enabled,disabled,markedDel
    t:{type:Date,default:Date.now}},//time
  pswd:{
    h:String,//hash
    s:String,//salt
    t:{type:Date,default:Date.now},//lastlogintime
    u:{type:Date,default:Date.now}},//lastupdtime
  sett:{l:{type:String,default:'EN'}},
  perm:{//status&time
    t:{s:{type:Boolean,default:false},ts:Date},//terms
    p:{s:{type:Boolean,default:false},ts:Date},//push
    l:{s:{type:Boolean,default:false},ts:Date},//loc
    i:{s:{type:Boolean,default:false},ts:Date},//img
    d:{s:{type:Boolean,default:false},ts:Date}},//data
  dvcs:[{
    k:String,//key/deviceId
    t:{type:Date,default:Date.now},//lastuse
    i:Object,//info
    _id:false}],
  prof:{
    u:{type:Schema.Types.ObjectId,ref:'JNAJ_User_Profile'},
    r:{type:Schema.Types.ObjectId,ref:'JNAJ_Recruiter_Profile'}}},
  {timestamps:true});
user.plugin(uniqueValidator,{message:'already exists.'});
user.virtual('toJSON').get(function(){
  var obj = this.toObject();
    ['_id','__v','pswd'].forEach(p => delete obj[p]);
    return obj;});
user.virtual('profile').get(function(){
  return {
    handle:this.handle,
    name:{
      first:this.name.f,
      last:this.name.l},
    profile:this.prof.u.toProfileJSONFor(this.prof.u)}});
user.statics.query = function(req,res,next){
  this.find(req.query).then(users => {
    req.users = users;
    return next()});}
user.statics.create = function(user,done){
  var obj = {
    acct:{s:'N'},
    name:{f:user.name.first,l:user.name.last},
    email:user.email,
    handle:user.handle},
  newUser = new this(obj);
  newUser.setPswd(user.pswd);
  newUser.registerDevice(user.device);
  return newUser.makeProfile(user.role);}
user.methods.makeProfile = function(role,data){
  let m = role ==='USER'?new User({handle:this.handle}):
  role==='RECRUITER'?new Recruiter({handle:this.handle}):
  role==='ADMIN'?new Admin({handle:this.handle}):null;
  this.prof[role.toLowerCase()[0]] = m._id;
  return m.save().then(() => this.save().then(() => this.getProfile(role)));}
user.methods.getProfile = function(role){
  return this.populate('prof.'+role.toLowerCase()[0])
  .execPopulate();}
user.methods.setPswd = function(pswd){
  if(typeof pswd == 'object'&&
    (!pswd.oldPswd||!this.validatePswd(pswd.oldPswd))) return false;
  else if(typeof pswd == 'object') pswd = pswd.newPswd;
  this.pswd.s = crypto.randomBytes(16).toString('hex');
  this.pswd.h = crypto.pbkdf2Sync(pswd,this.pswd.s,10000,512,'sha512').toString('hex');
  this.pswd.t = Date.now();
  return true}
user.methods.validatePswd = function(pswd){
  var hash = crypto.pbkdf2Sync(pswd,this.pswd.s,10000,512,'sha512').toString('hex');
  return this.pswd.h === hash;}
user.methods.registerDevice = function(thisDevice){
  this.dvcs.push({
    k:this.generateId(),
    i:thisDevice});
  return this.dvcs[this.dvcs.length-1].k;}
user.methods.validateDevice = function(thisDevice){
  let device;
  //try {
    function getValueStringSum(s){return s.split('').reduce((sum,c) => sum += Number(c),0);}
    thisDeviceSum = getValueStringSum(thisDevice);
    this.dvcs.forEach((d,i) => {
      let dSum = getValueStringSum(d.i);
      if((thisDeviceSum/dSum)>.95){
        here(thisDeviceSum/dSum);
        device = d;}});
    //}
  //catch(err){() => device = this.dvcs.filter(d => thisDevice == d.k)[0];}
  device?(device.t = Date.now()):this.registerDevice(thisDevice);
  return this.save().then(() => device.k);}
user.methods.auth = function(status,data){
  return this.validateDevice(data.device);}
  /*.then(k => 
    Obect.assign({},this.profile,
    {device:k},
    {role:data.role},
    {token:this.generateJWT(status,data.role,k)}));}*/
user.methods.generateId = function(){
  var S4 = function(){return (((1+Math.random())*0x10000)|0).toString(16).substring(1);};
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());}
user.methods.generateJWT = function(status,role,device){
  var today = new Date();
  var exp = new Date(today);
  status?exp.setDate(today.getDate()+60):exp.setDate(today.getDate()-60);
  return jwt.sign({
    role:role,
    handle:this.handle,
    device:device,
    exp:parseInt(exp.getTime()/1000),},secret);}
user.methods.update = function(data){
  for(p in data) this[p] = data[p];
  return this.save();}
module.exports = mongoose.model('JNAJ_User',user);

//user.methods.generateSlug = function(data){
  //return slug(data)+'-'+
  //(Math.random()*Math.pow(36,6)|0).toString(36);}
/*user.methods.setPin = function(pin){
  if(typeof pin == 'object'&&(!pin.oldPin||!this.validatePin(pin.oldPin))) return false;
  else if(typeof pin == 'object') pin = pin.newPin;
  this.pin.s = crypto.randomBytes(16).toString('hex');
  this.pin.h = crypto.pbkdf2Sync(pin,this.pin.salt,10000,512,'sha512').toString('hex');
  this.pin.t = Date.now();
  return true}
user.methods.validatePin = function(pin){
  var hash = crypto.pbkdf2Sync(pin,this.pin.s,10000,512,'sha512').toString('hex');
  return this.pin.h === hash;}*/