const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  uniqueValidator = require('mongoose-unique-validator');
var recruiter = new Schema({
  //handle:String,
  bio:{type:String,default:"No bio yet"},
  image: String,
  faves: [{type:Schema.Types.ObjectId}],
  links: [{type:Schema.Types.ObjectId, ref:'JNAJ_User_Profile'}],
  groups: [{type:Schema.Types.ObjectId, ref:'JNAJ_User_Group'}],
  articles: [{type:Schema.Types.ObjectId, ref: 'JNAJ_Article'}],
  samples: [{type:Schema.Types.ObjectId, ref: 'JNAJ_Sample'}],
  messages: [{type:Schema.Types.ObjectId, ref: 'JNAJ_Hiring_Inquiry'}],
  rewards: [{type:Schema.Types.ObjectId, ref: 'JNAJ_Reward'}],
  stats: [{type:Schema.Types.ObjectId, ref: 'JNAJ_User_Stats'}],
  sett:{
    u:Boolean,//upgraded
    i:Boolean},//in app ordering
  createdAt:{type:Date,default: Date.now},
  updatedAt:{type:Date,default: Date.now},
	lastActiveAt:{a:String,t:{type:Date,default: Date.now}}},
  {toObject:{virtuals:true}},
	{toJSON:{vitruals:true}});
/*recruiter.pre('save',function (next){
  if(!this.created) this.created = new Date;
  next();})
recruiter.pre('save',function (next){
  if(this.isNew) this.created = new Date;
  next();})*/
recruiter.methods.toProfileJSONFor = function(recruiter){
  return {
    handle:this.handle,
    bio: this.bio||"No bio yet.",
    linked:recruiter&&recruiter.handle?recruiter.isLinked(this._id):false,
    //groups:this.groups,
    image:this.image?this._id+'/'+this.image:"",
    //faves:this.faves,
    /*orders:this.orders,
    stats:this.stats,
    rewards:this.rewards,
    reviews:this.reviews,
    tagList: this.tagList,
    settings:{
      upgraded:this.sett.u,
      inAppOrders:this.sett.o,*/
    memberSince: this.created,
    lastUpdate: this.updated};}
recruiter.methods.update = function(data){
  data.handle&&data.handle!==this.handle?this.handle = data.handle:null;
  data.bio&&data.bio!==this.bio?this.bio = data.bio:null;
  data.image&&data.image!==this.image?this.image = data.image:null;
  return this.save();}
recruiter.methods.fave = function(id){
  if(this.faves.indexOf(id)<0){this.faves.push(id);}
  return this.save();};
recruiter.methods.unfave = function(id){
  this.faves.remove(id);
  return this.save();};
recruiter.methods.isFaved = function(id){
  return this.faves.some(function(faveId){
    return faveId.toString() === id.toString();});};
recruiter.methods.sendLink = function(id){
  if(this.links.indexOf(id) === -1){this.links.push(id);}
  return this.save();};
recruiter.methods.link = function(id){
  if(this.links.indexOf(id) === -1){this.links.push(id);}
  return this.save();};
recruiter.methods.unlink = function(id){
  this.links.remove(id);
  return this.save();};
recruiter.methods.isLinked = function(id){
  return this.links.some(function(linkId){
    return linkId.toString() === id.toString();});};
/*recruiter.methods.createGroup = function(id){
  if(this.following.indexOf(id) === -1){this.following.push(id);}
  return this.save();};
recruiter.methods.joinGroup = function(id){
  this.following.remove(id);
  return this.save();};
recruiter.methods.addToGroup = function(id){
  if(this.following.indexOf(id) === -1){this.following.push(id);}
  return this.save();};
recruiter.methods.postToGroup = function(id){
  this.following.remove(id);
  return this.save();};
recruiter.methods.removeGroup = function(id){
  if(this.following.indexOf(id) === -1){this.following.push(id);}
  return this.save();};
recruiter.methods.leaveGroup = function(id){
  this.following.remove(id);
  return this.save();};
recruiter.methods.removeFromGroup = function(id){
  if(this.following.indexOf(id) === -1){this.following.push(id);}
  return this.save();};
recruiter.methods.postToGroup = function(id){
  this.following.remove(id);
  return this.save();};
recruiter.methods.isInGroup = function(id){
  return this.following.some(function(followId){
    return followId.toString() === id.toString();});};*/
module.exports = mongoose.model('JNAJ_Recruiter_Profile',recruiter);