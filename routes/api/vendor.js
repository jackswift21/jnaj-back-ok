var router = require('express').Router(),
  passport = require('passport'),
  mongoose = require('mongoose'),
  User = require('../../models/User'),
  Vendor = require('../../models/Vendor');

router.get('/',function(req,res,next){
  passport.authenticate('vendor-jwt-required',{session:false},function(err,vendor,info){
    if(err){return next(err);}
    if(vendor){console.log(vendor.name.toUpperCase());return res.json({vendor:vendor.toAuthJSON()});}
    else{return res.status(422).json(info);}})(req,res,next)});
router.put('/',function(req,res,next){
  passport.authenticate('vendor-jwt-required',{session:false},function(err,vendor,info){
    if(err){return next(err);}
    if(vendor){return vendor.update(req.body).then(() => res.json({vendor:vendor.toAuthJSON()}));}
    else{return res.status(422).json(info);}})(req,res,next);});
router.post('/',function(req,res,next){
  if(!req.body.vendor.name) return res.status(422).send({errors:{name:'handle is missing'}});
  if(!req.body.vendor.pin) return res.status(422).send({errors:{error:'pin is missing'}});
  passport.authenticate('vendor-register',{session:false},function(err,vendor,info){
    if(err){return next(err);}
    if(vendor){return res.json({vendor:vendor.toAuthJSON()});}
    else{return res.status(422).json(info);}})(req,res,next);});
router.post('/login',function(req,res,next){
  if(!req.body.vendor.name) return res.status(422).json({errors:{name:"can't be blank"}});
  if(!req.body.vendor.pin) return res.status(422).json({errors:{pin:"can't be blank"}});
  passport.authenticate('vendor-login',{session:false},function(err,vendor,info){
    if(err){return next(err);}
    if(vendor){return res.json({vendor:vendor.toAuthJSON()});}
    else{return res.status(422).json(info);}})(req,res,next);});
router.delete('/',function(req,res,next){
  passport.authenticate('vendor-jwt-required',{session:false},function(err,vendor,info){
    if(err){return next(err);}
    if(vendor){return vendor.delete().then(() => res.json({deleted:vendor.name}));}
    else{return res.status(422).json(info);}})(req,res,next)});
module.exports = router;