const router = require('express').Router(),
  passport = require('passport'),
  mongoose = require('mongoose'),
  Article = require('../../models/Article'),
  Comment = require('../../models/Comment'),
  User = require('../../models/UserProfile');
router.param('article', function(req,res,next,slug){
  Article.findOne({slug:slug})
  .populate('author')
  .then(article => !article?res.sendStatus(404):(() => {req.article = article;return next();})())
  .catch(next);});
router.param('comment', function(req,res,next,id){
  Comment.findById(id)
  .then(comment => !comment?res.sendStatus(404):(() => {req.comment = comment;return next();})())
  .catch(next);});
router.get('/',function(req,res,next){
  passport.authenticate('auth-tkn-opt',{session:false},function(err,user,info){
    //console.log('ok');
    var query = {};
    var limit = 20;
    var offset = 0;
    if(typeof req.query.limit !== 'undefined'){limit = req.query.limit;}
    if(typeof req.query.offset !== 'undefined'){offset = req.query.offset;}
    if(typeof req.query.tag !== 'undefined' ){query.tagList = {"$in" : [req.query.tag]};}
    Promise.all([
      req.query.author?User.findOne({handle:req.query.author}):null,
      req.query.faved?User.findOne({handle:req.query.faved}):null])
    .then(function(results){
      var author = results[0];
      var favoriter = results[1];
      if(author){query.author = author._id;}
      if(favoriter){query._id = {$in: favoriter.faves};}
      else if(req.query.faved){query._id = {$in: []};}
      return Promise.all([
        Article.find(query)
          .limit(Number(limit))
          .skip(Number(offset))
          .sort({createdAt:'desc'})
          .populate('author')
          .exec(),
        Article.count(query).exec()])
      .then(function(results){
        var articles = results[0];
        var articlesCt = results[1];
        return res.json({
          articles:articles.map(article => article.toJSONFor(user?user.profiles.user:user)),
          articlesCt:articlesCt});})
      .catch(next);})
    .catch(next);})(req,res,next);});
router.get('/feed',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
    console.log(user);
    var limit = 20;
    var offset = 0;
    if(typeof req.query.limit !== 'undefined'){limit = req.query.limit;}
    if(typeof req.query.offset !== 'undefined'){offset = req.query.offset;}
    Promise.all([
      Article.find()
        .limit(Number(limit))
        .skip(Number(offset))
        .populate('author')
        .exec(),
      Article.count({author:{$in:user.profiles.user.faves}})])
    .then(results => {
      var articles = results[0];
      var articlesCt = results[1];
      return res.json({
        articles: articles.map(article => article.toJSONFor(user.profiles.user)),
        articlesCt: articlesCt});}).catch(next);})(req,res,next);});
router.post('/',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
    var article = new Article(req.body.article);
    article.author = user.profiles.user;
    return article.save()
    .then(() => res.json({article:article.toJSONFor(user.profiles.user)}))
    .catch(next);})(req,res,next);});
router.get('/:article',function(req,res,next){
  passport.authenticate('auth-tkn-opt',{session:false},function(err,user,info){
    req.article.populate('author')
    .execPopulate()
    .then(results => res.json({article:req.article.toJSONFor(user?user.profiles.user:null)}))
    .catch(next);})(req,res,next);});
router.put('/:article',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
    if(req.article.author._id.toString() === user.profiles.user.id.toString()){
      if(typeof req.body.article.title !== 'undefined'){req.article.title = req.body.article.title;}
      if(typeof req.body.article.description !== 'undefined'){req.article.description = req.body.article.description;}
      if(typeof req.body.article.body !== 'undefined'){req.article.body = req.body.article.body;}
      if(typeof req.body.article.tagList !== 'undefined'){req.article.tagList = req.body.article.tagList}
      req.article.save()
      .then(article => res.json({article: article.toJSONFor(user.profiles.user)}))
      .catch(next);}
    else {return res.sendStatus(403);}})(req,res,next);});
router.delete('/:article',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
    if(req.article.author._id.toString() === user.profiles.user.id.toString()){
      return req.article.remove().then(() => res.sendStatus(204));}
    else {return res.sendStatus(403);}})(req,res,next);});
router.post('/:article/fave',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
  var articleId = req.article._id;
  return user.profiles.user.fave(articleId).then(() => 
    req.article.updateFaveCount().then(article => 
      res.json({article:article.toJSONFor(user.profiles.user)})))
  .catch(next);})(req,res,next);});
router.delete('/:article/fave',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
  var articleId = req.article._id;
  return user.profiles.user.unfave(articleId).then(function(){
    return req.article.updateFaveCount().then(function(article){
      return res.json({article: article.toJSONFor(user.profiles.user)});});})
  .catch(next);})(req,res,next);});
router.get('/:article/comments',function(req,res,next){
  passport.authenticate('auth-tkn-opt',{session:false},function(err,user,info){
    req.article.populate({
      path: 'comments',
      populate: {path: 'author'},
      options: {sort: {createdAt: 'desc'}}})
    .execPopulate()
    .then(article => 
      res.json({comments: req.article.comments.map(comment => 
        comment.toJSONFor(user?user.profiles.user:null))}))
    .catch(next);})(req,res,next);});
router.post('/:article/comments',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
    var comment = new Comment(req.body.comment);
    comment.article = req.article;
    comment.author = user.profiles.user;
    return comment.save().then(() => {
      req.article.comments.push(comment);
      return req.article.save().then(article => 
        res.json({comment:comment.toJSONFor(user.profiles.user)}));})
    .catch(next);})(req,res,next);});
router.put('/:article/comments/:comment',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
  if(req.comment.author.toString() === user.profiles.user.id.toString()){
    //req.article.comments.remove(req.comment._id);
    req.article.save()
      .then(Comment.find({_id: req.comment._id}).remove().exec())
      .then(function(){res.sendStatus(204);});}
  else {res.sendStatus(403);}})(req,res,next);});
router.delete('/:article/comments/:comment',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
  if(req.comment.author.toString() === user.profiles.user.id.toString()){
    req.article.comments.remove(req.comment._id);
    req.article.save()
      .then(Comment.find({_id: req.comment._id}).remove().exec())
      .then(function(){res.sendStatus(204);});}
  else {res.sendStatus(403);}})(req,res,next);});
module.exports = router;
