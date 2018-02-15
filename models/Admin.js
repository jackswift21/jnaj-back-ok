var mongoose = require('mongoose'),
  uniqueValidator = require('mongoose-unique-validator'),
  crypto = require('crypto'),
  jwt = require('jsonwebtoken'),
  secret = require('../config').secret;
var admin = new mongoose.Schema({
  handle: {
    type: String,
    //lowercase: true,
    unique: true,
    required:[true,"can't be blank"],
    match: [/^[a-zA-Z0-9]+$/,'is invalid'],
    index: true},
  email:{
    type: String,
    lowercase: true,
    unique: true,
    //required:[true, "can't be blank"],
    match: [/\S+@\S+\.\S+/, 'is invalid']},
  role:{
    type:String,
    enum:['ADMIN','USER','VENDORMGR','EVENTVENDOR','GUEST'],
    default:'ADMIN'},
  name:{first:String,last:String},
  device:{d_id:String},
  bio: String,
  image: String,
  stats:[{type:mongoose.Schema.Types.ObjectId, ref:'FudeziUserStatList'}],
  settings:{
    tos:Boolean,
    lang:{type:String,enum:['EN','FR','SP','CH'],default:'EN'},
    inAppOrdering:Boolean,
    permissions:{
      loc:Boolean,
      img:Boolean,
      data:Boolean}},
  hash:String,
  salt:String},
  {timestamps: true});
admin.plugin(uniqueValidator,{message:'is already taken.'});
admin.statics.register = function(req,res,next){}
admin.statics.query = function(req,res,next){
  this.find().then(admins => {req.admins = admins;return next()});}
admin.statics.deleteAll = function(req,res,next){
  this.remove().then(function(del){
    console.log(del.result);
    if(del.result.ok){req.body.delCt = del.result.n;return next();}});}
admin.methods.update = function(data){
  typeof data.handle !== 'undefined'?this.handle = data.handle:
  //typeof data.email !== 'undefined'?admin.email = data.email:
  typeof data.bio !== 'undefined'?this.bio = data.bio:
  typeof data.image !== 'undefined'?this.image = data.image:
  typeof data.pin !== 'undefined'?this.setPin(data.pin):null;
  return this.save().then(() => this).catch(next);}
admin.methods.setPin = function(pin){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(pin,this.salt,10000,512,'sha512').toString('hex');};
admin.methods.validatePin = function(pin){
  var hash = crypto.pbkdf2Sync(pin,this.salt,10000,512,'sha512').toString('hex');
  console.log(this.hash === hash);
  return this.hash === hash;}
admin.methods.generateJWT = function(){
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);
  return jwt.sign({
    id: this._id,
    role:this.role,
    handle: this.handle,
    exp: parseInt(exp.getTime()/1000),},secret);};
admin.methods.toAuthJSON = function(){
  return {
    id:this._id,
    handle: this.handle,
    //email: this.email,
    token: this.generateJWT(),
    bio: this.bio||"",
    image: this.image||""};}
admin.methods.toProfileJSONFor = function(admin){
  console.log('we hve it');
  return {
    handle: this.handle,
    bio: this.bio||"",
    image: this.image||'https://static.productionready.io/images/smiley-cyrus.jpg',}
    //following: admin?admin.isFollowing(this._id):false};
  }
/*admin.methods.fave = function(id){
  if(this.favorites.indexOf(id) === -1){this.favorites.push(id);}
  return this.save();};
admin.methods.unfave = function(id){
  this.faves.remove(id);
  return this.save();};
admin.methods.isFave = function(id){
  return this.faves.some(function(favoriteId){
    return favoriteId.toString() === id.toString();});};
admin.methods.follow = function(id){
  if(this.following.indexOf(id) === -1){this.following.push(id);}
  return this.save();};
admin.methods.unfollow = function(id){
  this.following.remove(id);
  return this.save();};
admin.methods.isFollowing = function(id){
  return this.following.some(function(followId){
    return followId.toString() === id.toString();});};*/
module.exports = mongoose.model('FudeziAdmin',admin);