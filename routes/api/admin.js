var router = require('express').Router(),
  passport = require('passport'),
  mongoose = require('mongoose'),
  User = require('../../models/User'),
  Admin = require('../../models/Admin');

router.get('/all',
  function(req,res,next){Admin.query(req,res,next)},
  function(req,res){res.json({admins:req.admins})});
router.get('/',function(req,res,next){
  passport.authenticate('admin-jwt-required',{session:false},function(err,admin,info){
    if(err){return next(err);}
    if(admin){
      console.log(admin.handle.toUpperCase());
      return res.json({fuAdmin:admin.toAuthJSON()});}
    else{return res.status(422).json(info);}})(req,res,next)});
router.put('/',function(req,res,next){
  passport.authenticate('admin-jwt-required',{session:false},function(err,admin,info){
    if(err){return next(err);}
    if(admin){
      return admin.update(req.body)
      .then(() => res.json({fuAdmin:admin.toAuthJSON()}));}
    else{return res.status(422).json(info);}})(req,res,next);});
router.post('/',function(req,res,next){
  if(!req.body.fuAdmin.handle) return res.status(422).send({errors:{error:'handle is missing'}});
  if(!req.body.fuAdmin.pin) return res.status(422).send({errors:{error:'pin is missing'}});
  passport.authenticate('admin-register',{session:false},function(err,admin,info){
    if(err){return next(err);}
    if(admin){return res.json({fuAdmin:admin.toAuthJSON()});}
    else{return res.status(422).json(info);}})(req,res,next);});
router.post('/login',function(req,res,next){
  if(!req.body.fuAdmin.handle) return res.status(422).json({errors:{handle:"can't be blank"}});
  if(!req.body.fuAdmin.pin) return res.status(422).json({errors:{pin:"can't be blank"}});
  passport.authenticate('admin-login',{session:false},function(err,admin,info){
    if(err){return next(err);}
    if(admin){return res.json({fuAdmin:admin.toAuthJSON()});}
    else{return res.status(422).json(info);}})(req,res,next);});
router.delete('/',function(req,res,next){
  passport.authenticate('admin-jwt-required',{session:false},function(err,admin,info){
    if(err){return next(err);}
    if(admin){
      return admin.delete(req.body)
      .then(() => res.json({deleted:admin.name}));}
    else{return res.status(422).json(info);}})(req,res,next)});

/*router.get('/admins',
  function(req,res,next){User.query(req,res,next)},
  function(req,res){res.json({admins:req.admins})});
router.delete('/admins',
  function(req,res,next){User.deleteAll(req,res,next)},
  function(req,res){res.json({delCt:req.body.delCt});});
router.post('/admins',function(req,res,next){
  if(!req.body.admin.handle) return res.status(422).send({errors:{error:'handle is missing'}});
  if(!req.body.admin.pin) return res.status(422).send({errors:{error:'pin is missing'}});
  passport.authenticate('local-register',{session:false},function(err,admin,info){
    if(err){return next(err);}
    if(admin){return res.json({admin:admin.toAuthJSON()});}
    else{return res.status(422).json(info);}})(req,res,next);});
router.post('/admins/login',function(req,res,next){
  if(!req.body.admin.handle) return res.status(422).json({errors:{handle:"can't be blank"}});
  if(!req.body.admin.pin) return res.status(422).json({errors:{pin:"can't be blank"}});
  passport.authenticate('local-auth',{session:false},function(err,admin,info){
    if(err){return next(err);}
    if(admin){return res.json({admin:admin.toAuthJSON()});}
    else{return res.status(422).json(info);}})(req,res,next);});
router.get('/vendor',function(req,res,next){
  passport.authenticate('auth-required',{session:false},function(err,admin,info){
    if(err){return next(err);}
    if(admin){return res.json({admin:admin.toAuthJSON()});}
    else{return res.status(422).json(info);}})(req,res,next)});
router.put('/vendor',function(req,res,next){
  passport.authenticate('auth-required',{session:false},function(err,admin,info){
    if(err){return next(err);}
    if(admin){
      return admin.update(req.body)
      .then(() => res.json({admin:admin.toAuthJSON()}));}
    else{return res.status(422).json(info);}})(req,res,next);});*/
module.exports = router;