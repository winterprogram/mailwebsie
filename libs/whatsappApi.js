const accountSid = '';
const authToken = '';
const client = require('twilio')(accountSid, authToken);

client.messages
    .create({
        from: 'whatsapp:+14155238886',
        body: `Hello There!!
    You are registered with Freechers.`,
        to: 'whatsapp:+919167162019'
    })
    .then(message => console.log(message.sid));





