const nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port:465,
  secure:true,
  auth:{
    type: 'OAuth2',
    user: 'Jack1.fu.dz@gmail.com',
    clientId:'1075388803900-ll5a2ec667kgcr7mcj1b6v3srnmjm2lb.apps.googleusercontent.com',
    clientSecret:'jMbnARYyagEGQFAU20YJX7uc',
    refreshToken:'1/4lmB8R6PGRkXu0Lzh897N0jmcAod9UaZwY3jopAax6k',
    accessToken: 'ya29.GltjBV-HwYJagubkpJhe5qu3cUIg3xw2W7YqbIuxmvFYBUTutVwgPgorjS6nZI8XtFdu6LHossSg-HpKsQLl1pDKl9HdD1mtJhPePsY4slE9nwGzwpEda6W7DKS3'}});
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