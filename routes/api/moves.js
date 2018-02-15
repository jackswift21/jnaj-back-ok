var router = require('express').Router(),
  passport = require('passport'),
  mongoose = require('mongoose'),
  User = require('../../models/User');

/*router.get('/',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
    if(err){return next(err);}
    return user?
      res.json({user:user.toAuthJSON()}):
      res.status(422).json(info);})(req,res,next)});
router.put('/',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
    if(err){return next(err);}
    return user?
      user.update(req.body).then(() => res.json({user:user.toAuthJSON()})):
      res.status(422).json(info)})(req,res,next);});*/
router.post('/',function(req,res,next){console.log(req.body.move);return res.json({move:req.body.move})});
  /*if(!req.body.user.handle) return res.status(422).send({errors:{error:'handle is missing'}});
  if(!req.body.user.pin) return res.status(422).send({errors:{error:'pin is missing'}});
  if(!req.body.user.role) return res.status(422).send({errors:{error:'pin is missing'}});
  if(!req.body.user.role==='ADMIN'&&!req.body.user.code) return res.status(422).send({errors:{error:'admin code is missing'}});
  //if(!req.body.user.email) return res.status(422).send({errors:{error:'email is missing'}});
  //if!(req.body.user.firstName&&req.body.user.firstName) return res.status(422).send({errors:{error:'first or last name missing'}});
  passport.authenticate('auth-register',{session:false},function(err,user,info){
    if(err){return next(err);}
    return user?
      res.json({user:user.toAuthJSON()}):
      res.status(422).json(info);})(req,res,next);});*/
/*router.post('/login',function(req,res,next){
  if(!req.body.user.handle) return res.status(422).json({errors:{handle:"can't be blank"}});
  if(!req.body.user.pin) return res.status(422).json({errors:{pin:"can't be blank"}});
  passport.authenticate('auth-login',{session:false},function(err,user,info){
    if(err){return next(err);}
    return user?
      res.json({user:user.toAuthJSON()}):
      res.status(422).json(info);})(req,res,next);});
router.delete('/',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
    if(err){return next(err);}
    return user?
      user.delete(req.body).then(() => res.json({deleted:user.name})):
      res.status(422).json(info);})(req,res,next)});*/
module.exports = router;