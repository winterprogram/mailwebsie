const sendgrid = require('@sendgrid/mail');
sendgrid.setApiKey("");
sendgrid.send({
    from: 'test@example.com',
    to: 'chakladar.sandeep3@gmail.com', //replace that with your email
    attachments: [],
    subject: 'testing sendgrid',
    html: '<html><head></head><body></body></html>'
}, function(error) {
    if (error) {
        console.error(error);
    }
});

// const msg = {
//     to: 'chakladar.sandeep3@gmail.com',
//     from: 'test@example.com',
//     subject: 'Sending with SendGrid is Fun',
//     text: 'and easy to do anywhere, even with Node.js',
//     html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// };

// sgMail.send(msg);