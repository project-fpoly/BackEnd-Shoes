import Joi from "joi"

export const signUpValidator = Joi.object({
    userName: Joi.string().required().min(6).max(255),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6).max(255),
    confirmPassword: Joi.string().required().valid(Joi.ref("password")),
    role: Joi.string()
})


export const signInValidator = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6).max(255),
})
export const updateValidator = Joi.object({
    deliveryAddress: Joi.array().required().items(Joi.string().min(3).max(255)).max(3),
    userName: Joi.string().required().min(6).max(255),
    gender: Joi.string().required().valid("male", "female", "other"),
    dateOfBirth: Joi.date().required().iso(),
    avt: Joi.string().required(),
    phoneNumbers: Joi.array()
      .items(Joi.string().min(10).max(11))
      .max(3)
      .required()
      .unique(),
  });