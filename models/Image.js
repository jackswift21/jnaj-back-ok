var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var image = new Schema({
	path:String,
	uploadedBy:
	isProfile:Boolean},
	{timestamps:true});
module.exports=mongoose.model('FudeziImage',image);