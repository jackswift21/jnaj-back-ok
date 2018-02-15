const router = require('express').Router(),
  passport = require('passport'),
  mongoose = require('mongoose'),
  User = require('../../models/UserProfile');
  config = require('../../config'),
  path = require('path'),
  mime = require('mime'),
  fs = require('fs'),
  multer = require('multer'),
  upload = multer({storage:multer.diskStorage({
    destination:function(req,file,cb){
      var newDestination = 'uploads/'+req.profile._id;
      var dir = null;
      try {dir = fs.statSync(newDestination);}
      catch(err){fs.mkdirSync(newDestination);}
      if(dir&&!dir.isDirectory()){throw new Error('Directory cannot be created at "' +newDestination+'"');}
      cb(null,newDestination)},})}).single('file');
const downloadFile = function(req,res,next){
  var file = path.join(__dirname, '..','..','/uploads/' + req.params.img);//or whatever kind of file
  var filename = path.basename(file);
  var mimetype = mime.lookup(file);
  res.writeHead(200,{'Content-disposition':'attachment;filename=' + filename,'Content-Type':mimetype});
  var filestream = fs.createReadStream(file);
  return filestream.pipe(res);}
router.param('handle',function(req,res,next,handle){
  User.findOne({handle:handle})
  .then(user => !user?res.sendStatus(404):(() => {req.profile = user;return next();})())
  .catch(next);});
router.get('/:handle',function(req,res,next){
  passport.authenticate('auth-tkn-opt',{session:false},function(err,user,info){
    err?next(err):
    user?res.json({profile:req.profile.toProfileJSONFor(user.profiles.user)}):
    info.message === 'No auth token'?res.json({profile:req.profile.toProfileJSONFor(null)}):
    res.status(422).json({name:info.name,message:info.message});})(req,res,next);});
router.put('/:handle',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
    err?next(err):
    user?req.profile.update(req.body.user,info.role).then(() => 
      res.json({profile:req.profile.toProfileJSONFor(user.profiles.user)})):
      res.status(422).json({name:info.name,message:info.message});})(req,res,next);});
router.post('/:handle/link',function(req,res,next){
  var profileId = req.profile._id;
  passport.authenticate('auth-tkn-opt',{session:false},function(err,user,info){
    return user.profiles.user.link(profileId)
      .then(() => res.json({profile:req.profile.toProfileJSONFor(user.profiles.user)}))
      .catch(next);})(req,res,next);});
router.delete('/:handle/link',function(req,res,next){
  var profileId = req.profile._id;
  passport.authenticate('auth-tkn-opt',{session:false},function(err,user,info){
    return user.profiles.user.unlink(profileId)
      .then(() => res.json({profile:req.profile.toProfileJSONFor(user.profiles.user)}))
      .catch(next)})(req,res,next);});
router.post('/:handle/uploads',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
    err?next(err):
    user?next():
    !user?res.status(422).json({name:'error',message:'user not found'}):
    res.status(422).json({name:info.name,message:info.message});})(req,res,next);},
  upload,function(req,res,next){
    req.profile.update({image:req.file.filename});
    res.json({uploaded:req.profile._id+'/'+req.file.filename});});
module.exports = router;