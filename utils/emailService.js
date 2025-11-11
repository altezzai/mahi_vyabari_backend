const fs = require("fs");
const path = require("path");

const { sendEmail } = require("./nodemailer");

const getShopWelcomeContent = (name, email, phone) => {
  const subject = "Welcome to Mahe Vyapari!";

  const templatePath = path.join(__dirname, "../templates/shopWelcome.html");
  let html = fs.readFileSync(templatePath, "utf-8");

  html = html.replace(/{{shopName}}/g, name);
  html = html.replace(/{{email}}/g, email);
  html = html.replace(/{{phone}}/g, phone);

  return { subject, html };
};

const sendShopWelcomeEmail = async (shopName, email, phone) => {
  const { subject, html } = getShopWelcomeContent(shopName, email, phone);
  try {
    await sendEmail(email, subject, html);
    console.log(`Welcome email successfully sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send welcome email to ${email}:`, error);
  }
};

module.exports = {
  sendShopWelcomeEmail,
};
