// const sgMail = require('@sendgrid/mail');
// require('dotenv').config();

// const { SENDGRID_API_KEY } = process.env;

// sgMail.setApiKey(SENDGRID_API_KEY);

// const sendEmail = async data => {
//   const email = { ...data, from: 'nelya.teslenko.95@gmail.com' };
//   await sgMail.send(email);
//   return true;
// };

// module.exports = sendEmail;

const nodemailer = require('nodemailer');
require('dotenv').config();

const { META_PASWORD } = process.env;

const nodemailerConfig = {
  host: 'smtp.meta.ua',
  port: 465,
  secure: true,
  auth: {
    user: 'nelya95@meta.ua',
    pass: META_PASWORD,
  },
};

const transport = nodemailer.createTransport(nodemailerConfig);

const sendEmail = async data => {
  const email = { ...data, from: 'nelya95@meta.ua' };
  console.log('email', email);
  await transport
    .sendMail(email)
    .then(() => console.log('Email success send'))
    .catch(error => console.log(error.message));
  return true;
};
module.exports = sendEmail;
