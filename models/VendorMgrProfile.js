const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  uniqueValidator = require('mongoose-unique-validator');
var vendorMgr = new Schema({
  handle:String,
  bio:{type:String,default:"No bio yet"},
  image: String,
  faves: [{type:Schema.Types.ObjectId, ref: 'FudeziMenuItem'}],
  links: [{type:Schema.Types.ObjectId, ref:'FudeziUserProfile'}],
  groups: [{type:Schema.Types.ObjectId, ref:'FudeziUserGroup'}],
  reviews: [{type:Schema.Types.ObjectId, ref: 'FudeziReview'}],
  orders: [{type:Schema.Types.ObjectId, ref: 'FudeziOrder'}],
  rewards: [{type:Schema.Types.ObjectId, ref: 'FudeziReward'}],
  stats: [{type:Schema.Types.ObjectId, ref: 'FudeziUserStatList'}],
  settings:{inAppOrdering:Boolean},
  created:{type:Date,default: Date.now},
  updated:{type:Date,default: Date.now}},
  {toObject:{virtuals:true}},
  {toJSON:{vitruals:true}},
  {timestamps:true});
/*vendorMgr.pre('save',function (next){
  if(!this.created) this.created = new Date;
  next();})
vendorMgr.pre('save',function (next){
  if(this.isNew) this.created = new Date;
  next();})*/
vendorMgr.methods.toProfileJSONFor = function(vendorMgr){
  return {
    handle:this.handle,
    bio: this.bio||"No bio yet.",
    linked:vendorMgr&&vendorMgr.handle?vendorMgr.isLinked(this._id):false,
    //groups:this.groups,
    image:this.image?this._id+'/'+this.image:"",
    //faves:this.faves,
    /*orders:this.orders,
    stats:this.stats,
    rewards:this.rewards,
    reviews:this.reviews,
    tagList: this.tagList,
    settings:this.settings,*/
    memberSince: this.created,
    lastUpdate: this.updated};}
vendorMgr.methods.update = function(data){
  data.handle&&data.handle!==this.handle?this.handle = data.handle:null;
  data.bio&&data.bio!==this.bio?this.bio = data.bio:null;
  data.image&&data.image!==this.image?this.image = data.image:null;
  return this.save();}
vendorMgr.methods.fave = function(id){
  if(this.faves.indexOf(id)<0){this.faves.push(id);}
  return this.save();};
vendorMgr.methods.unfave = function(id){
  this.faves.remove(id);
  return this.save();};
vendorMgr.methods.isFaved = function(id){
  return this.faves.some(function(faveId){
    return faveId.toString() === id.toString();});};
vendorMgr.methods.sendLink = function(id){
  if(this.links.indexOf(id) === -1){this.links.push(id);}
  return this.save();};
vendorMgr.methods.link = function(id){
  if(this.links.indexOf(id) === -1){this.links.push(id);}
  return this.save();};
vendorMgr.methods.unlink = function(id){
  this.links.remove(id);
  return this.save();};
vendorMgr.methods.isLinked = function(id){
  return this.links.some(function(linkId){
    return linkId.toString() === id.toString();});};
vendorMgr.methods.addAcctUser = function(data){}
vendorMgr.methods.removeAcctUser = function(data){}
vendorMgr.methods.addAcctMgr = function(data){}
vendorMgr.methods.removeAcctMgr = function(data){}
/*vendorMgr.methods.createGroup = function(id){
  if(this.following.indexOf(id) === -1){this.following.push(id);}
  return this.save();};
vendorMgr.methods.joinGroup = function(id){
  this.following.remove(id);
  return this.save();};
vendorMgr.methods.addToGroup = function(id){
  if(this.following.indexOf(id) === -1){this.following.push(id);}
  return this.save();};
vendorMgr.methods.postToGroup = function(id){
  this.following.remove(id);
  return this.save();};
vendorMgr.methods.removeGroup = function(id){
  if(this.following.indexOf(id) === -1){this.following.push(id);}
  return this.save();};
vendorMgr.methods.leaveGroup = function(id){
  this.following.remove(id);
  return this.save();};
vendorMgr.methods.removeFromGroup = function(id){
  if(this.following.indexOf(id) === -1){this.following.push(id);}
  return this.save();};
vendorMgr.methods.postToGroup = function(id){
  this.following.remove(id);
  return this.save();};
vendorMgr.methods.isInGroup = function(id){
  return this.following.some(function(followId){
    return followId.toString() === id.toString();});};*/
module.exports = mongoose.model('FudeziVendorMgrProfile',vendorMgr);