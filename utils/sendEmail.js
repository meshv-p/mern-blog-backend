const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: "devblog1823@gmail.com", // generated ethereal user
        pass: "cumwhsfrckfmejcl", // generated ethereal password
      },
    });

    await transporter.sendMail({
      from: "devblog1823@gmail.com", // sender address
      to: email,
      subject,
      text,
      html,
    });

    console.log("email sent sucessfully", email);
  } catch (error) {
    throw error;
    console.log(error, "email not sent");
  }
};

module.exports = sendEmail;
