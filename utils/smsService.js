const twilio = require("twilio");

const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

module.exports = {
  sendSMS: async (phone, message) => {
    try {
      const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE, // Twilio number
        to: phone, // User phone number
      });

      console.log("OTP SMS sent:", result.sid);
      return result;
    } catch (error) {
      console.error("SMS sending error:", error);
      throw error;
    }
  },
};
