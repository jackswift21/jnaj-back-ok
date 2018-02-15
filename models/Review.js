var mongoose = require('mongoose'),
  uniqueValidator = require('mongoose-unique-validator'),
  slug = require('slug'),
  Schema = mongoose.Schema,
  User = require('./UserProfile'),
  Vendor = require('./VendorProfile');
var review = new Schema({
  slug:{type: String,lowercase:true,unique:true},
  description:String,
  body: String,
  rating:{type:Number},
  favesCt:{type:Number,default:0},
  comments:[{type:Schema.Types.ObjectId, ref: 'Comment'}],
  tagList:[{type:String}],
  author:{type:Schema.Types.ObjectId, ref:'FudeziUserProfile'},
  vendor:{type:Schema.Types.ObjectId, ref:'FudeziVendorProfile'}},
  {timestamps: true});
review.plugin(uniqueValidator,{message:'is already taken'});
review.pre('validate',function(next){
  if(!this.slug){this.slugify();}
  next();});
review.methods.slugify = function() {
  this.slug = slug(this.description) +
  '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);};
review.methods.updateFaveCount = function(){
  var review = this;
  return User.count({faves:{$in:[review._id]}})
  .then(count => {
    review.favesCt = count;
    return review.save();});};
review.methods.toJSONFor = function(user){
  return {
    slug: this.slug,
    description: this.description,
    body: this.body,
    rating:this.rating,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    tagList: this.tagList,
    faved:user?user.isFaved(this._id):false,
    favesCt:this.favesCt,
    author:this.author.toProfileJSONFor(user),
    //vendor:this.vendor.toProfileJSONFor(user),
  };}
module.exports = mongoose.model('FudeziReview',review);
