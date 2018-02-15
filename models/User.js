const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  uniqueValidator = require('mongoose-unique-validator'),
  crypto = require('crypto'),
  jwt = require('jsonwebtoken'),
  slug = require('slug'),
  secret = require('../config').secret,
  User = require('./UserProfile'),
  VendorMgr = require('./VendorMgrProfile'),
  VendorUser = require('./VendorUserProfile'),
  Admin = require('./AdminProfile');
var user = new Schema({
  name:{first:String,last:String},
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
    //required:[true, "can't be blank"],
    match: [/\S+@\S+\.\S+/, 'is invalid']},
  acct:{
    verified:{code:String,ts:Date},
    status:{type:String,enum:['N','L','E','D','X']},//new,locked,enabled,disabled,recentDeleted
    ts:{type:Date,default:Date.now}},
  pin:{
    hash:String,
    salt:String,
    ts:{type:Date,default:Date.now}},
  settings:{lang:{type:String,enum:['EN','FR','SP','CH'],default:'EN'}},
  permissions:{
    tos:{status:{type:Boolean,default:false},ts:Date},
    push:{status:{type:Boolean,default:false},ts:Date},
    loc:{status:{type:Boolean,default:false},ts:Date},
    img:{status:{type:Boolean,default:false},ts:Date},
    data:{status:{type:Boolean,default:false},ts:Date}},
  devices:[{
    ts:{type:Date,default:Date.now},
    key:String,
    info:Object,
    _id:false,}],
  profiles:{
    user:{type:Schema.Types.ObjectId,ref:'FudeziUserProfile'},
    vendor_mgr:{type:Schema.Types.ObjectId,ref:'FudeziVendorMgrProfile'},
    vendor_user:{type:Schema.Types.ObjectId,ref:'FudeziVendorUserProfile'},
    admin:{type:Schema.Types.ObjectId,ref:'FudeziAdminProfile'}}},
  {timestamps:true});
user.plugin(uniqueValidator,{message:'is already taken.'});
user.statics.create = function(user,done){
  let o = Object.assign({},user);
  (['ADMIN','VENDOR_USER'].indexOf(o.role)+1)&&!Admin.validateAdminCode(o.code)?
  done(null,false,{name:'code',message:'invalid'}):null;
  ['pin','device','code','role'].forEach(p => delete o[p]);
  //console.log(user,o);
  var newUser = new this(Object.assign({},o,{acct:{status:'E'}}));
  newUser.setPin(user.pin);
  newUser.registerDevice(user.device);
  return newUser.makeProfile(user.role);}
user.statics.query = function(req,res,next){
  this.find(req.query).then(users => {
    req.users = users;
    return next()});}
user.statics.delete = function(req,res,next){
  return new Promise(done => {
    req.users.length?
      (() => {
        req.body.deleted = {delCt:0,users:[]};
        Promise.all(req.users.map(o => 
          this.findAndRemove(o.handle).then(del => 
            del.result.ok?(() => {req.body.deleted.delCt++;req.body.deleted.users.push(o.handle);})():next('something s wrong'))));})():
      this.remove({}).then(del => del.result.ok?(req.body.deleted = {delCt:del.result.n,users:'_ALL_'}):next('something s wrong'));
      return next();});}
user.methods.registerDevice = function(device){this.devices.push({info:device});return true;}
user.methods.makeProfile = function(role,data){
  let m = role ==='USER'?new User({handle:this.handle}):
  role==='VENDOR_MGR'?new VendorMgr({handle:this.handle,data:data}):
  role==='VENDOR_USER'?new VendorUser({handle:this.handle,data:data}):
  role==='ADMIN'?new Admin({handle:this.handle}):null;
  this.profiles[role.toLowerCase()] = m._id;
  return m.save().then(() => this.save().then(() => this.getProfile(role)));}
user.methods.getProfile = function(role){return this.populate('profiles.'+role.toLowerCase()).execPopulate();}
user.methods.update = function(role,data){
  data.handle&&data.handle!==this.handle?this.handle = data.handle:null;
  data.email&&data.email!==this.email?this.email = data.email:null;
  if(data.profile) this.setProfile(role,data.profile);
  if(data.settings) this.setSettings(role,data.settings);
  return this.save().then(() => this.getProfile(role));}
user.methods.delete = function(role){return this.remove().then(del => {
    here(del.result);
    if(del.result.ok){
      req.body.deleted = {delCt:del.result.n,user:req.body.user.handle};
      return next();}});}
user.methods.auth = function(data){
  return this.setSession(true,data).then(token => {
    return {
    handle:this.handle,
    email:this.email,
    token:token,
    role:data.role,
    profile:this.profiles[data.role.toLowerCase()].toProfileJSONFor()}});}
user.methods.unauth = function(data){return this.setSession(false,data);}
user.methods.validatePin = function(pin){
  var hash = crypto.pbkdf2Sync(pin,this.pin.salt,10000,512,'sha512').toString('hex');
  return this.pin.hash === hash;}
user.methods.setPin = function(pin){
  if(typeof pin == 'object'&&(!pin.oldPin||!this.validatePin(pin.oldPin))) return false;
  else if(typeof pin == 'object') pin = pin.newPin;
  this.pin.salt = crypto.randomBytes(16).toString('hex');
  this.pin.hash = crypto.pbkdf2Sync(pin,this.pin.salt,10000,512,'sha512').toString('hex');
  this.pin.t = Date.now();
  return true}
user.methods.setSession = function(status,data){
  here(status,data);
  return new Promise(done => {
    let device = this.devices.filter(d => d.info.pseudofier === data.device.pseudofier)[0];
    device.t = Date.now();
    status?
    (() => {device.key = this.generateId();this.save().then(() => done(this.generateJWT(data.role,device)));})():
    (() => {device.key = '';this.save().then(() => done())})();});}
user.methods.setAcct = function(status){
  status==='e'?this.acct = {s:'E',t:Date.now()}:
  status==='d'?this.acct = {s:'D',t:Date.now()}:
  status==='l'?this.acct = {s:'L',t:Date.now()}:
  status==='x'?this.acct = {s:'X',t:Date.now()}:null;
  return this.save();}
user.methods.setProfile = function(role,profile){return this.profiles[role.toLowerCase()].update(profile);}
user.methods.setSettings = function(role,settings){
  settings.lang&&settings.lang!==this.settings.lang?this.settings.lang = settings.lang:null;
  return this.save().then(() => this.profiles[role.toLowerCase()].update({settings:settings}));}
user.methods.generateId = function(){
  var S4 = function(){return (((1+Math.random())*0x10000)|0).toString(16).substring(1);};
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());}
user.methods.generateSlug = function(data){return slug(data)+'-'+(Math.random()*Math.pow(36,6)|0).toString(36);}
user.methods.generateJWT = function(role,device){
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);
  return jwt.sign({
    role:role,
    handle:this.handle,
    device:JSON.stringify({key:device.key,id:device.pseudofier}),
    exp:parseInt(exp.getTime()/1000),},secret);}
user.methods.toJSON = function(){
  var obj = this.toObject();
  ['_id','__v','pin'].forEach(p => delete obj[p]);
  return obj;}
module.exports = mongoose.model('FudeziUser',user);