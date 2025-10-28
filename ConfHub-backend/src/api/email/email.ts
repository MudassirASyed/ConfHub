const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'bzchair.org',      // Your domain's SMTP host
  port: 587,                // TLS port
  secure: false,            // false for port 587 (true only for 465)
  auth: {
    user: 'no-reply@bzchair.org',  // Full email address
    pass: 'Gy;?fbL[etnKN(5#',    // Password for no-reply@bzchair.org
  },
  tls: {
    rejectUnauthorized: false // optional, helps avoid some certificate issues
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: 'no-reply@bzchair.org',  // sender name and address
    to,                                         // recipient
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
module.exports = sendEmail;
// sendMail.js
// const sgMail = require("@sendgrid/mail");

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// async function sendEmail(to, subject, text, html) {
//   const msg = {
//     to, // recipient email
//     from: "bse213005@cust.pk", // ✅ must be your verified single sender
//     subject,
//     text,
//     html,
//   };

//   try {
//     await sgMail.send(msg);
//     console.log("✅ Email sent successfully!");
//   } catch (error) {
//     console.error("❌ Error sending email:", error.response?.body || error);
//   }
// }

// module.exports = sendEmail;
