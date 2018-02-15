var mongoose = require('mongoose'),
  uniqueValidator = require('mongoose-unique-validator'),
  slug = require('slug'),
  User = require('./User'),
  crypto = require('crypto'),
  jwt = require('jsonwebtoken'),
  secret = require('../config').secret;
//User =   require('./user.model'),
      //var Stat = require('./stat.model'),
      //Image = require('./Image'),
      //Menu = require('./menu.model');
var vendor = new mongoose.Schema({
  slug: {type: String, lowercase: true, unique: true,index:true},
  name:{
    type: String,
    unique: true,
    required:[true,"can't be blank"],
    match: [/^[a-zA-Z0-9]+$/,'is invalid'],
    index: true},
  bio: String,
  cuisine: String,
  favesCount:{type:Number,default:0},
  tagList: [{type:String}],
  uploads:[{type:mongoose.Schema.Types.ObjectId,ref:'FudeziImage'}],
  comments:[{type:mongoose.Schema.Types.ObjectId,ref:'Comment'}],
  acct_mgrs:[{type: mongoose.Schema.Types.ObjectId, ref: 'FudeziUser'}],
  menu:[{ type: mongoose.Schema.Types.ObjectId, ref: 'FudeziMenu' }],
  orders:[{ type: mongoose.Schema.Types.ObjectId, ref: 'FudeziOrder'}],
  reviews:[{ type: mongoose.Schema.Types.ObjectId, ref: 'FudeziReview'}],
  hours:{open:String,close:String},
  stats:{ type: mongoose.Schema.Types.ObjectId, ref: 'FudeziStat' },
  locs:[{
    x:Number,
    y:Number,
    ts:Number}],
  settings:{
    lang:String,
    tos:Boolean,
    permissions:{
      loc:Boolean,
      maps:Boolean,
      analytics:Boolean,
      privacy:Boolean},
    inAppOrdering:Boolean,
    pmtTypes:[{type:String,enum:['$','c','p','g','a']}],
    menu:{type:mongoose.Schema.Types.ObjectId, ref: 'FudeziMenu' },
    tools:[String]},
  acct_hist:[{
    action:{type:String,enum:['created','updated','disabled','enabled']},
    by:{ type: mongoose.Schema.Types.ObjectId, ref: 'FudeziUser' },
    ts:Number}],
  hash:String,
  salt:String},
  {toObject:{virtuals:true}},
  {toJSON:{vitruals:true}},
  {timestamps: true});
vendor.virtual('profile')
  .get(function(){
    return {
      id: this._id,
      name:this.name,
      cuisine:this.cuisine,
      hours:this.hours,
      profilePic:this.profile_pic,
      rating:this.stats.rating,
      lastLoc:this.last_location,
      pmtTypes:this.settings.pmtTypes}});
vendor.virtual('profile_ext')
  .get(function(){
    return Object.assign({},this.profile,{
      likeCt:this.stats.likes.length,
      faveCt:this.stats.faves.length,
      reviewCt:this.reviews.length,
      imgCt:this.images.length,
      menu:this.settings.currentMenu.text,
      desc:this.desc});});
vendor.virtual('profile_pic')
  .get(function(){
    return this.ulpoad.length?
    this.uploads.filter(i => i.isProfile)[0]:null})
  .set(function(img){
    let u = this.uploads;
    let currentProfilePic = u.splice(i => i.isProfile)[0];
    let newProfilePic = u.splice(i => i.id === img.id)[0];
    currentProfilePic.isProfile = false,
    newProfilePic.isProfile = true;
    currentProfilePic.save().then(function(){
      newProfilePic.save().then(function(){
        this.set({uploads:[...u,currentProfilePic,newProfilePic]});});});});
vendor.plugin(uniqueValidator, {message: 'is already taken'});
vendor.pre('validate',function(next){
  if(!this.slug){this.slugify();}
  next();});
vendor.methods.slugify = function() {
  this.slug = slug(this.name) +
    '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);};
vendor.methods.updateFavoriteCount = function() {
  var vendor = this;
  return User.count({faves:{$in:[vendor._id]}})
  .then(function(count){
    vendor.favesCount = count;
    return vendor.save();});};
vendor.methods.toJSONFor = function(user){
  return {
    slug: this.slug,
    name: this.name,
    bio: this.bio,
    cuisine:this.cuisine,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    tagList: this.tagList,
    favorited:user?user.isFavorite(this._id):false,
    favoritesCount:this.favesCount,
    hours:this.hours,
    profilePic:this.profile_pic};}
vendor.methods.setPin = function(pin){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(pin,this.salt,10000,512,'sha512').toString('hex');};
vendor.methods.validatePin = function(pin){
  var hash = crypto.pbkdf2Sync(pin,this.salt,10000,512,'sha512').toString('hex');
  console.log(this.hash === hash);
  return this.hash === hash;}
vendor.methods.generateJWT = function(){
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);
  return jwt.sign({
    id: this._id,
    name: this.name,
    exp: parseInt(exp.getTime()/1000),},secret);};
vendor.methods.toAuthJSON = function(){
  return {
    id:this._id,
    name: this.name,
    //email: this.email,
    token: this.generateJWT(),
    bio: this.bio||"",
    image: this.image||""};}
vendor.methods.toProfileJSONFor = function(user){
  console.log('we hve it');
  return {
    name: this.name,
    bio: this.bio||"",
    image: this.image||'https://static.productionready.io/images/smiley-cyrus.jpg',}
    //following: user?user.isFollowing(this._id):false};
  }
module.exports = mongoose.model('FudeziVendor', vendor);
