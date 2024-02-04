const Joi = require("joi");

const authUserSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(4).required(),
});

module.exports = { authUserSchema };
