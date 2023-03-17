const Joi = require('joi');

const verifyEmail = Joi.object({
  email: Joi.string().required(),
});

module.exports = verifyEmail;
