var router = require('express').Router(),
  passport = require('passport'),
  Vendor =  require('../../models/VendorProfile'),
  User = require('../../models/UserProfile');

router.param('slug',function(req,res,next,slug){
  Vendor.findOne({slug:slug})
  .then(vendor => !vendor?res.sendStatus(404):(() => {req.vendor = vendor;return next();})())
  .catch(next);});
router.get('/',function(req,res,next){
  passport.authenticate('auth-tkn-opt',{session:false},function(err,user,info){
    var query = {};
    var limit = 20;
    var offset = 0;
    if(typeof req.query.limit !== 'undefined'){limit = req.query.limit;}
    if(typeof req.query.offset !== 'undefined'){offset = req.query.offset;}
    if(typeof req.query.tag !== 'undefined' ){query.tagList = {"$in" : [req.query.tag]};}
    /*Promise.all([
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
      //else if(req.query.faved){query._id = {$in: []};}*/
    Promise.all([
      Vendor.find(query)
        .limit(Number(limit))
        .skip(Number(offset))
        .sort({createdAt:'desc'})
        .populate('acct_mgrs')
        .exec(),
      Vendor.count(query).exec()])
    .then(results => {
      var vendors = results[0];
      var vendorsCt = results[1];
      return res.json({
        vendors:vendors.map(v => v.toProfileJSONFor(user?user.profiles.user:null)),
        vendorsCt:vendorsCt});})
      //.catch(next);})
    .catch(next);})(req,res,next);});
router.post('/',function(req,res,next){
  passport.authenticate('auth-tkn-req',{session:false},function(err,user,info){
    err?next(err):
    user?
      user.makeProfile('VENDOR',req.body.vendor).then(user => {
        const index = user.profiles.vendor.length-1;
        return res.json({vendor:user.profiles.vendor[index].toProfileJSONFor(user.profiles.user)})}):
      res.status(422).json(info);})(req,res,next);});
router.get('/:slug',function(req,res,next){
  passport.authenticate('auth-tkn-opt',{session:false},function(err,user,info){
    err?next(err):
    user?res.json({vendor:req.vendor.toProfileJSONFor(user.profiles.user)}):
    info.message==='No auth token'?res.json({profile:req.vendor.toProfileJSONFor(null)}):
    res.status(422).json(info);})(req,res,next);});
router.post('/:slug/link',function(req,res,next){
  var vendorId = req.vendor._id;
  passport.authenticate('auth-tkn-opt',{session:false},function(err,user,info){
    return user.profiles.user.link(vendorId)
      .then(() => res.json({vendor:req.vendor.toProfileJSONFor(user.profiles.user)}))
      .catch(next);})(req,res,next);});
router.delete('/:slug/link',function(req,res,next){
  var vendorId = req.vendor._id;
  passport.authenticate('auth-tkn-opt',{session:false},function(err,user,info){
    return user.profiles.user.unlink(vendorId)
      .then(() => res.json({vendor:req.vendor.toProfileJSONFor(user.profiles.user)}))
      .catch(next)})(req,res,next);});
module.exports = router;