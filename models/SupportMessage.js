const mongoose = require('mongoose'),
  uniqueValidator = require('mongoose-unique-validator'),
  slug = require('slug'),
  User = mongoose.model('FudeziUser');
var reply = new mongoose.Schema({
  body: String,
  author:{type:mongoose.Schema.Types.ObjectId, ref: 'FudeziUser'},
  article:{type:mongoose.Schema.Types.ObjectId, ref: 'Message'}},
  {timestamps: true});,
var message = new mongoose.Schema({
  slug:{type: String, lowercase: true, unique: true},
  subject:String,
  type:{
    type:String,
    enum:['partner','tech','billing','general','vendor_accts','other'],
    default:'general'},
  body: String,
  comments:[{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
  author:{type: mongoose.Schema.Types.ObjectId, ref: 'FudeziUser'}},
  {timestamps: true});
message.plugin(uniqueValidator,{message:'is already taken'});
message.pre('validate',function(next){
  if(!this.slug){this.slugify();}
  next();});
message.methods.slugify = function() {
  this.slug = slug(this.title) +
  '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);};
message.methods.updateFavoriteCount = function() {
  var article = this;
  return User.count({favorites: {$in: [article._id]}})
  .then(function(count){
    article.favoritesCount = count;
    return article.save();});};
message.methods.toJSONFor = function(user){
  return {
    slug: this.slug,
    title: this.title,
    description: this.description,
    body: this.body,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    tagList: this.tagList,
    favorited: user ? user.isFavorite(this._id) : false,
    favoritesCount: this.favoritesCount,
    author: this.author.toProfileJSONFor(user)};};
mongoose.model('FudeziMessage',message);