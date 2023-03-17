const createVerifyEmail = (email, verificationToken) => {
  const mail = {
    to: email,
    subject: 'Підтвердити',
    html: `<a href="http://localhost:3001/api/users/verify/${verificationToken}" target="_blank" rel="noopener noreferrer"> Підтвердити реєстрацію!</a>`,
  };
  return mail;
};

module.exports = createVerifyEmail;
