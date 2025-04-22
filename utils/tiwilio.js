const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);
const sendSMS = async (to, message) => {
  try {
    const sms = await twilioClient.messages.create({
      body: message,
      from: process.env.PHONE_NUMBER,
      to,
    });
    console.log(`Message sent to ${to} with SID: ${sms.sid}`);
  } catch (error) {
    console.error(`Failed to send SMS to ${to}:`, error.message);
  }
};

module.exports = sendSMS;
