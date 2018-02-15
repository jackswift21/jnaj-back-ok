const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  uniqueValidator = require('mongoose-unique-validator');
  crypto = require('crypto'),
  jwt = require('jsonwebtoken'),
  slug = require('slug'),
  secret = require('../config').secret;
  //User = require('./UserProfile')
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
    minLength:8,
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
      s:String,//signature
      t:Date},//time
    s:{type:String,enum:['N','L','E','D','X']},//status-new,locked,enabled,disabled,recentDeleted
    t:{type:Date,default:Date.now}},//time
  pin:{
    h:String,//hash
    s:String,//salt
    t:{type:Date,default:Date.now}},//time
  sett:{l:{type:String,enum:['EN','FR','SP','CH'],default:'EN'}},
  perm:{//status&time
    t:{s:{type:Boolean,default:false},ts:Date},//tac
    p:{s:{type:Boolean,default:false},ts:Date},//push
    l:{s:{type:Boolean,default:false},ts:Date},//loc
    i:{s:{type:Boolean,default:false},ts:Date},//img
    d:{s:{type:Boolean,default:false},ts:Date}},//data
  dvcs:[{
    n:String,//name
    t:{type:Date,default:Date.now},//time created
    i:Object,//info
    a:Boolean,//active
    _id:false}],
  prof:{u:{type:Schema.Types.ObjectId,ref:'JNAJ_User_Profile'}}},
  {timestamps:true});
user.plugin(uniqueValidator,{message:'already exists.'});
user.virtual('toJSON').get(function(){
  var obj = this.toObject();
    ['_id','__v','pin'].forEach(p => delete obj[p]);
    return obj;});
user.virtual('toProfileJSON').get(function(){
  return {
    name:{first:this.name.f,last:this.name.l},
    profile:this.prof.u}});
user.statics.query = function(req,res,next){
  this.find(req.query).then(users => {
    req.users = users;
    return next()});}
user.statics.create = function(user,done){
  var newUser = new this(Object.assign({},user,{acct:{s:'E'}}));
  return newUser.save();}
user.methods.update = function(data){
  for(p in data) this[p] = data[p];
  return this.save();}
module.exports = mongoose.model('JNAJ_User',user);