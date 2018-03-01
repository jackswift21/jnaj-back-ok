const router = require('express').Router(),
	mongoose = require('mongoose'),
	profiles = require('../../data/profiles'),
	TERMS = require('../../data/terms');
	//Tag = mongoose.model('Article');

router.get('/go',function(req,res,next){
	!req.query.q?res.status(422).json(errors[1]):null;
	let query = JSON.parse(req.query.q);
	res.json({results:profiles});});
router.get('/suggest',function(req,res,next){
	let terms = [],query = req.query.q.toLowerCase(),theseTerms = [...TERMS,...newTerms];
	terms = theseTerms.filter(term => term.v.toLowerCase().match(new RegExp(query)));
	terms.sort(termSorter.bind(query));
	terms.length>10?terms.splice(10):null;
	res.json({terms:terms});});
router.post('/suggest',function(req,res,next){
	!req.body.newTerm?res.status(422).json(errors[0]):null;
	newTerms.push(req.body.newTerm);
	res.json({termAdded:true});});
/*router.get('/go',function(req,res,next){
	Article
		.find()
		.distinct('tagList')
		.then(function(tags){
			return res.json({tags:tags});})
		.catch(next);});*/
module.exports = router;

var newTerms = [];
const errors = [
{name:'newTerm',message:'missing'},
{name:'searchQuery',message:'missing'},];
function termSorter(a,b){
	let byQMatch = a.v.toLowerCase().indexOf(this) - b.v.toLowerCase().indexOf(this),
	byAlpha = a.v.toLowerCase() === [a.v.toLowerCase(),b.v.toLowerCase()].sort()[0];
	return byQMatch?byQMatch:byAlpha?-1:1;}