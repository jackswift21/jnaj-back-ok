const router = require('express').Router();
router.use('/connect',require('./connect'));
router.use('/user',require('./user'));
router.use('/articles',require('./articles'));
router.use('/vendors',require('./vendors'));
router.use('/profiles',require('./profiles'));
router.use('/reviews',require('./reviews'));
router.use('/tags',require('./tags'));
//router.use('/orders',require('./orders'));
//router.use('/menus',require('./menus'));
//router.use('/vendor',require('./vendor'));
//router.use('/users',require('./users'));
//router.use('/admin',require('./admin'));
//router.use('/moves',require('./moves'));
router.use(function(err,req,res,next){
  if(err.name === 'ValidationError'){
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function(errors, key){
        errors[key] = err.errors[key].message;
        return errors;},{})});}
  return next(err);});
module.exports = router;