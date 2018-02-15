const router = require('express').Router(),
  passport = require('passport'),
  mongoose = require('mongoose'),
  User = require('../../models/User');
router.post('/',function(req,res,next){
  !req.body.user.handle?res.status(422).json(errors[0]):
  !req.body.user.pin?res.status(422).json(errors[1]):
  !req.body.user.email?res.status(422).json(errors[2]):
  !req.body.user.role?res.status(422).json(errors[3]):
  (['VENDOR_MGR','VENDOR_USER'].indexOf(req.body.user.role)+1)&&!(req.body.user.firstName&&req.body.user.firstName)?res.status(422).json(errors[4]):
  (['ADMIN','VENDOR_USER'].indexOf(req.body.user.role)+1)&&!req.body.user.code?res.status(422).json(errors[5]):null;
  passport.authenticate('auth-register',{session:false},function(err,user,info){
    return err?next(err):
    user?user.auth(info).then(user => res.json(user)):
    res.status(422).json(info);})(req,res,next);});
router.get('/',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
    return err?next(err):
    user?user.auth(info).then(user => res.json(user)):
    res.status(422).json(info);})(req,res,next)});
router.put('/',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
    return err?next(err):
    user?user.update(info.role,req.body.user).then(upd => upd.auth(info).then(user => res.json(user))):
    res.status(422).json(info);})(req,res,next);});
router.delete('/',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
    return err?next(err):
    user?user.setAcct('_del').then(del => res.json(user.handle)):
    res.status(422).json(info);})(req,res,next)});
router.post('/login',function(req,res,next){
  !req.body.user.handle?res.status(422).json(errors[0]):
  !req.body.user.pin?res.status(422).json(errors[1]):
  !req.body.user.role?res.status(422).json(errors[3]):null;
  passport.authenticate('auth-login',{session:false},function(err,user,info){
    return err?next(err):
    user?user.auth(info).then(user => res.json(user)):
    res.status(422).json(info);})(req,res,next);});
router.put('/login',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
    return err?next(err):
    user?user.setPin(req.body.user.pin)?
      user.auth(info).then(user => res.json(user)):
      res.status(422).json(errors[5]):
    res.status(422).json({name:info.name,message:info.mesage});})(req,res,next);});
router.delete('/login',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
    return err?next(err):
    user?user.unauth(info).then(() => res.json(user.handle)):
    res.status(422).json({name:info.name,message:info.mesage});})(req,res,next);});
router.post('/verify',function(req,res,next){
  !req.body.user.handle?res.status(422).json(errors[0]):
  !req.body.user.code?res.status(422).json(errors[7]):
  !req.body.user.role?res.status(422).json(errors[3]):null;
  passport.authenticate('auth-verify-register',{session:false},function(err,user,info){
    return err?next(err):
    user?user.auth(info).then(user => res.json(user)):
    res.status(422).json(info);})(req,res,next);});
module.exports = router;

const errors = [
  {name:'handle',message:'missing'},
  {name:'pin',message:'missing'},
  {name:'email',message:'missing'},
  {name:'role',message:'missing'},
  {name:'name',message:'missing'},
  {name:'code',message:'missing'},
  {name:'pin',message:'invalid'},
  {name:'code',message:'missing'}];

