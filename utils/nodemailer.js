const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});
// const transporter = nodemailer.createTransport({
//   host:"smtp-relay.brevo.com",
//   port:"587",
//   auth:{
//     user:process.env.SMTP_USER,
//     pass:process.env.SMTP_PASS,

//   }
// });
transporter.verify((error, success) => {
  if (error) {
    console.log(error);
    logger.error(error);
  } else {
    console.log("Ready for messages");
    console.log(success);
  }
});
module.exports = {
  sendEmail: async (email, subject, message) => {
    const mailOptions = {
      from: `"Mahe Vyapari" <${process.env.AUTH_EMAIL}>`,
      to: email,
      subject: subject,
      html: message,
    };
    transporter.sendMail(mailOptions);
  },
};
