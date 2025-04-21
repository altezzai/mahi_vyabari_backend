const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready for messages");
    console.log(success);
  }
});
module.exports = {
  sendEmail: async (email,subject,message) => {
    const mailOptions = {
      from:  `"Mahe Vyapari" <${process.env.AUTH_EMAIL}>`,
      to: email,
      subject: subject,
      html:message,
    };
    transporter.sendMail(mailOptions);
  },
};
