const mongoose = require('mongoose'),
  uniqueValidator = require('mongoose-unique-validator'),
  slug = require('slug'),
  Schema = mongoose.Schema,
  User = require('./UserProfile');
var article = new Schema({
  slug:{type: String,lowercase:true,unique:true},
  title: String,
  description:String,
  body: String,
  favesCt:{type: Number, default:0},
  comments:[{type:Schema.Types.ObjectId, ref: 'Comment'}],
  tagList:[{type: String }],
  author: {type:Schema.Types.ObjectId, ref: 'FudeziUserProfile'}},
  {timestamps: true});
article.plugin(uniqueValidator, {message: 'is already taken'});
article.pre('validate',function(next){
  if(!this.slug){this.slugify();}
  next();});
article.methods.slugify = function() {
  this.slug = slug(this.title) +
  '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);};
article.methods.updateFaveCount = function(){
  var article = this;
  return User.count({faves:{$in:[article._id]}})
  .then(function(count){
    article.favesCt = count;
    return article.save();});};
article.methods.toJSONFor = function(user){
  return {
    slug: this.slug,
    title: this.title,
    description: this.description,
    body: this.body,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    tagList: this.tagList,
    faved: user.handle?user.isFaved(this._id):false,
    favesCt: this.favesCt,
    author: this.author.toProfileJSONFor(user)};};
module.exports = mongoose.model('Article', article);