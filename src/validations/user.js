import Joi from "joi";

export const signUpValidator = Joi.object({
  userName: Joi.string().required().min(6).max(255),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6).max(255),
  confirmPassword: Joi.string().required().valid(Joi.ref("password")),
});

export const signInValidator = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6).max(255),
});
export const updateValidator = Joi.object({
    deliveryAddress: Joi.array()
    .max(3)
    .required(),
  userName: Joi.string().required().min(6).max(255),
  gender: Joi.string().required().valid("male", "female", "other"),
  dateOfBirth: Joi.date().required().iso(),
  avt: Joi.string().required(),
  phoneNumbers: Joi.array()
    .max(3)
    .required()
});
export const createValidator = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6).max(255),
  userName: Joi.string().required().min(6).max(255),
  role: Joi.string(),
  deliveryAddress: Joi.array()
    .max(3)
    .required(),
  gender: Joi.string().required().valid("male", "female", "other"),
  dateOfBirth: Joi.date().required().iso(),
  avt: Joi.string().required(),
  phoneNumbers: Joi.array()
    .max(3)
    .required()
});
