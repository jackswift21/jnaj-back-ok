var router = require('express').Router(),
  passport = require('passport'),
  mongoose = require('mongoose'),
  User = require('../../models/User');

router.get('/',
  function(req,res,next){User.query(req,res,next)},
  function(req,res){res.json({users:req.users})});
router.post('/',function(req,res,next){
  if(!req.body.user.handle) return res.status(422).send({errors:{error:'handle is missing'}});
  if(!req.body.user.pin) return res.status(422).send({errors:{error:'pin is missing'}});
  passport.authenticate('local-register',{session:false},function(err,user,info){
    if(err){return next(err);}
    if(user){return res.json({user:user.toAuthJSON()});}
    else{return res.status(422).json(info);}})(req,res,next);});
router.post('/login',function(req,res,next){
  if(!req.body.user.handle) return res.status(422).json({errors:{handle:"can't be blank"}});
  if(!req.body.user.pin) return res.status(422).json({errors:{pin:"can't be blank"}});
  passport.authenticate('local-auth',{session:false},function(err,user,info){
    if(err){return next(err);}
    if(user){return res.json({user:user.toAuthJSON()});}
    else{return res.status(422).json(info);}})(req,res,next);});
router.delete('/',
  function(req,res,next){User.deleteAll(req,res,next)},
  function(req,res){res.json({delCt:req.body.delCt});});
module.exports = router;