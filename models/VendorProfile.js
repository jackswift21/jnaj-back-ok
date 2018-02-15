const mongoose = require('mongoose'),
  uniqueValidator = require('mongoose-unique-validator'),
  slug = require('slug'),
  User = require('./UserProfile');
  //var Stat = require('./stat.model'),
  //Image = require('./Image'),
  //Menu = require('./menu.model');
var vendor = new mongoose.Schema({
  slug: {type: String, lowercase: true, unique: true,index:true},
  name:{
    type:String,
    unique:true,
    required:[true,"can't be blank"],
    match:[/^[a-zA-Z0-9 -_''""]+$/,'is invalid'],
    index:true},
  bio: String,
  cuisine: String,
  favesCt:{type:Number,default:0},
  tagList: [String],
  uploads:[String],//{type:mongoose.Schema.Types.ObjectId,ref:'FudeziImage'}],
  //comments:[{type:mongoose.Schema.Types.ObjectId,ref:'Comment'}],
  acct_mgrs:[{type: mongoose.Schema.Types.ObjectId, ref: 'FudeziUser'}],
  menu:[Object],
  //{ type: mongoose.Schema.Types.ObjectId, ref: 'FudeziMenu' }],
  //orders:[{ type: mongoose.Schema.Types.ObjectId, ref: 'FudeziOrder'}],
  //reviews:[{ type: mongoose.Schema.Types.ObjectId, ref: 'FudeziReview'}],
  hours:{open:String,close:String},
  //stats:{ type: mongoose.Schema.Types.ObjectId, ref: 'FudeziStat' },
  locs:[{
    x:Number,
    y:Number,
    ts:Number}],
  settings:{
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
    by:{type: mongoose.Schema.Types.ObjectId, ref: 'FudeziUser'},
    ts:Number,
    notes:String}],
  created:{type:Date,default:Date.now},
  updated:{type:Date,default:Date.now}},
  {toObject:{virtuals:true}},
  {toJSON:{vitruals:true}},
  {timestamps:true});
vendor.virtual('profile')
  .get(function(){
    return {
      slug: this.slug,
      name:this.name,
      bio: this.bio,
      cuisine:this.cuisine,
      hours:this.hours,
      //profilePic:this.profile_pic,
      //rating:this.stats.rating,
      //lastLoc:this.last_location,
      pmtTypes:this.settings.pmtTypes,
      tagList: this.tagList,
      isFaved:user?user.isFaved(this._id):false,
      favesCt:this.favesCt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt}});
vendor.virtual('profile_ext')
  .get(function(){
    return Object.assign({},this.profile,{
      likeCt:this.stats.likes.length,
      faveCt:this.stats.faves.length,
      reviewCt:this.reviews.length,
      imgCt:this.uploads.length,
      menu:this.settings.menu.text,
      bio:this.bio});});
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
vendor.methods.toProfileJSONFor = function(user){
  return {
    slug: this.slug,
    name:this.name,
    bio: this.bio,
    cuisine:this.cuisine,
    hours:this.hours,
    //profilePic:this.profile_pic,
    //rating:this.stats.rating,
    //lastLoc:this.locs[this.locs.length-1],
    pmtTypes:this.settings.pmtTypes,
    tagList: this.tagList,
    isFaved:user?user.handle?user.isFaved(this._id):false:false,
    favesCt:this.favesCt,
    acct_mgrs:this.acct_mgrs.map(m => m.handle),
    memberSince:this.created,
    lastUpdated:this.updated}}
module.exports = mongoose.model('FudeziVendorProfile', vendor);
