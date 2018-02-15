var router = require('express').Router(),
  passport = require('passport'),
  mongoose = require('mongoose'),
  Review = require('../../models/Review'),
  Comment = require('../../models/Comment'),
  User = require('../../models/UserProfile');

router.param('review', function(req,res,next,slug){
  Review.findOne({slug:slug})
  .populate('author')
  .then(review => !review?res.sendStatus(404):(() => {req.review = review;return next();})())
  .catch(next);});
router.param('comment', function(req,res,next,id){
  Comment.findById(id)
  .then(comment => !comment?res.sendStatus(404):(() => {req.comment = comment;return next();})())
  .catch(next);});
router.get('/',function(req,res,next){
  passport.authenticate('auth-tkn-opt',{session:false},function(err,user,info){
    var query = {};
    var limit = 20;
    var offset = 0;
    if(typeof req.query.limit !== 'undefined'){limit = req.query.limit;}
    if(typeof req.query.offset !== 'undefined'){offset = req.query.offset;}
    if(typeof req.query.tag !== 'undefined' ){query.tagList = {"$in" : [req.query.tag]};}
    Promise.all([
      req.query.vendor?Vendor.findOne({name:req.query.vendor}):null,
      req.query.author?User.findOne({handle:req.query.author}):null,
      //req.query.faved?User.findOne({handle:req.query.faved}):null
      ])
    .then(function(results){
      var vendor = results[0];
      var author = results[1];
      //console.log(vendor,author);
      //var favoriter = results[2];
      if(vendor){query.vendor = vendor._id;}
      if(author){query.author = author._id;}
      //if(favoriter){query._id = {$in: favoriter.faves};}
      //else if(req.query.faved){query._id = {$in: []};}
      return Promise.all([
        Review.find(query)
          .limit(Number(limit))
          .skip(Number(offset))
          .sort({createdAt:'desc'})
          .populate('author')
          .exec(),
        Review.count(query).exec()])
      .then(function(results){
        var reviews = results[0];
        var reviewsCt = results[1];
        return res.json({
          reviews:reviews.map(review => review.toJSONFor(user?user.profiles.user:user)),
          reviewsCt:reviewsCt});})
      .catch(next);})
    .catch(next);})(req,res,next);});
router.post('/',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
    //Vendor.findOne({name:req.body.review.vendor})
    //.then(vendor => {
      //delete req.body.review.vendor;
      var review = new Review(req.body.review);
      review.author = user.profiles.user;
      //review.vendor = vendor;
      return review.save().then(() => res.json({review:review.toJSONFor(user.profiles.user)}))//})
    .catch(next);})(req,res,next);});
router.put('/:review',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
    if(req.review.author._id.toString() === user.profiles.user.id.toString()){
      if(typeof req.body.review.description !== 'undefined'){req.review.description = req.body.review.description;}
      if(typeof req.body.review.body !== 'undefined'){req.review.body = req.body.review.body;}
      if(typeof req.body.review.rating !== 'undefined'){req.review.rating = req.body.review.rating;}
      if(typeof req.body.review.tagList !== 'undefined'){req.review.tagList = req.body.review.tagList}
      req.review.save()
      .then(review => res.json({review: review.toJSONFor(user.profiles.user)}))
      .catch(next);}
    else {return res.sendStatus(403);}})(req,res,next);});
router.delete('/:review',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
    if(req.review.author._id.toString() === user.profiles.user.id.toString()){
      return req.review.remove().then(() => res.sendStatus(204));}
    else {return res.sendStatus(403);}})(req,res,next);});
router.post('/:review/fave',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
  var reviewId = req.review._id;
  return user.profiles.user.fave(reviewId).then(() => 
    req.review.updateFaveCount().then(review => 
      res.json({review:review.toJSONFor(user.profiles.user)})))
  .catch(next);})(req,res,next);});
router.delete('/:review/fave',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
  var reviewId = req.review._id;
  return user.profiles.user.unfave(reviewId).then(function(){
    return req.review.updateFaveCount().then(function(review){
      return res.json({review: review.toJSONFor(user.profiles.user)});});})
  .catch(next);})(req,res,next);});
module.exports = router;
//edit comment

/*router.get('/feed', auth.required, function(req, res, next) {
  var limit = 20;
  var offset = 0;
  if(typeof req.query.limit !== 'undefined'){limit = req.query.limit;}
  if(typeof req.query.offset !== 'undefined'){offset = req.query.offset;}
  passport.authenticate('auth-tkn-opt',{session:false},function(err,user,info){
    Promise.all([
      Article.find({author:{$in:user.following}})
        .limit(Number(limit))
        .skip(Number(offset))
        .populate('author')
        .exec(),
      Article.count({ author: {$in: user.following}})
    ]).then(function(results){
      var articles = results[0];
      var articlesCount = results[1];

      return res.json({
        articles: articles.map(function(article){
          return article.toJSONFor(user);
        }),
        articlesCount: articlesCount
      });
    }).catch(next);
  });
});
router.get('/:review',function(req,res,next){
  passport.authenticate('auth-tkn-opt',{session:false},function(err,user,info){
    req.review.populate('author')
    .execPopulate()
    .then(results => res.json({review:req.review.toJSONFor(user?user.profiles.user:null)}))
    .catch(next);})(req,res,next);});
router.get('/:review/comments',function(req,res,next){
  passport.authenticate('auth-tkn-opt',{session:false},function(err,user,info){
    req.review.populate({
      path: 'comments',
      populate: {path: 'author'},
      options: {sort: {createdAt: 'desc'}}})
    .execPopulate()
    .then(review => 
      res.json({comments: req.review.comments.map(comment => 
        comment.toJSONFor(user?user.profiles.user:null))}))
    .catch(next);})(req,res,next);});
router.post('/:review/comments',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
    var comment = new Comment(req.body.comment);
    comment.review = req.review;
    comment.author = user.profiles.user;
    return comment.save().then(() => {
      req.review.comments.push(comment);
      return req.review.save().then(review => 
        res.json({comment:comment.toJSONFor(user.profiles.user)}));})
    .catch(next);})(req,res,next);});
router.delete('/:review/comments/:comment',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
  if(req.comment.author.toString() === user.profiles.user.id.toString()){
    req.review.comments.remove(req.comment._id);
    req.review.save()
      .then(Comment.find({_id: req.comment._id}).remove().exec())
      .then(function(){res.sendStatus(204);});}
  else {res.sendStatus(403);}})(req,res,next);});*/
