var mongoose = require('mongoose'),Schema = mongoose.Schema;
var comment = new Schema({
  body: String,
  author:{type:Schema.Types.ObjectId, ref: 'FudeziUserProfile'},
  article:{type:Schema.Types.ObjectId, ref: 'Article'}},
  {timestamps: true});
comment.methods.toJSONFor = function(user){
  return {
    id: this._id,
    body: this.body,
    createdAt: this.createdAt,
    author: this.author.toProfileJSONFor(user)};};
module.exports = mongoose.model('Comment',comment);
