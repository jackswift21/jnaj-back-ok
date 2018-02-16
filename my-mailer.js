const nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port:465,
  secure:true,
  auth:{
    type: 'OAuth2',
    user: 'jackneedsajob01@gmail.com',
    clientId:'512726554322-0nmsg9ooil4krbadrkn3pg628c57c9oi.apps.googleusercontent.com',
    clientSecret:'nUnsV7isVm7HF8qAr-Cu4VNf',
    refreshToken:'1/p6XqindpvZ_NlQeuVcDGlZ_0mBuzZHQlWJGHRfuIk-e5KgtxY5pwXdzFJ9cyO20P',
    accessToken: 'ya29.GltkBeDqQNTcp6qf14T9m4qrM0CUzAGtLRhPYKqK9xbovWGY87h__Dvr7QlB8j2FOFM5q9xGQkbOXXdsnwi9bFYJxEGyKfyRyTAvUHDg_VQPkScotJ_8ixT73WjF'}});
module.exports = {
  send:function({_from,_to,_subject,_html,_text}){
    return new Promise(done => {
      var mailOptions = {
        from: _from,
        to: _to,
        subject: _subject,
        html: _html,
        text: _text};
      transporter.sendMail(mailOptions,(err,info) => {
        if(err) return here(err);
        done('Message '+info.messageId+' sent: %s'+info.response);});});}}