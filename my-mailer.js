const nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth:{
    type: 'OAuth2',
    user: 'jack1.fu.dz@gmail.com',
    clientId:'196661760685-su9ghf989naj7ubqvjr7t1o4ebd9aqpl.apps.googleusercontent.com',
    clientSecret:'Ks_sKmCsFtsTKpTjfkTMUt7l',
    refreshToken:'1/7P1EBfiLbHyNARl5VgvL_oRcH1KyEs7e7L3f4ZsX7BA'}});
var mailOptions = {
  from: 'Jack <jack1.fu.dz@gmail.com>',
  to: 'jlpowersjr@aol.com',
  subject: 'Test Email',
  text: 'This is a test email from Fudezi Api Service. '+
    'Click here to confirm acknowledge your receipt of this email. '+
    'DO NOT RESPOND TO EMAIL DIRECTLY. '+
    'Thank you, Jack.'};
transporter.sendMail(mailOptions,function(err,info){
  if(err){console.log(err);}
  else {console.log('Email sent: ' + info.response);}});