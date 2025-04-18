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
  sendEmail: async (email, userName, password) => {
    const mailOptions = {
      from:  `"Mahe Vyapari" <${process.env.AUTH_EMAIL}>`,
      to: email,
      subject: "Welcome to Mahe Vyapari!",
      html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px #ccc;">
                  <h2 style="color: #4CAF50;">Welcome, ${userName} 👋</h2>
                  <p>Your account has been created by the Admin.</p>
                  <p><strong>Login Email:</strong> ${email}</p>
                  <p><strong>Password:</strong><span style="font-weight:900;"> ${password}</span></p>
                  <p>Please login and change your password immediately for security reasons.</p>
                  <br/>
                  <p>Thanks,<br/>Team Mahe Vyapari</p>
                </div>
              </div>
            `,
    };
    transporter.sendMail(mailOptions);
  },
};
