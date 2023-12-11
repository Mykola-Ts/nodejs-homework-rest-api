import Joi from "joi";

export const userSignupSchema = Joi.object({
  email: Joi.string().required().messages({
    "any.required": "missing required email field",
  }),
  password: Joi.string().required().messages({
    "any.required": "missing required password field",
  }),
  subscription: Joi.string(),
});

export const userVerifySchema = Joi.object({
  email: Joi.string().required().messages({
    "any.required": "missing required email field",
  }),
});

export const userSigninSchema = Joi.object({
  email: Joi.string().required().messages({
    "any.required": "missing required email field",
  }),
  password: Joi.string().required().messages({
    "any.required": "missing required password field",
  }),
});
