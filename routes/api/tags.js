const router = require('express').Router(),
	mongoose = require('mongoose'),
	Article = require('../../models/Article');
router.get('/',function(req,res,next){
	Article
		.find()
		.distinct('tagList')
		.then(function(tags){
			return res.json({tags:tags});})
		.catch(next);});
module.exports = router;
