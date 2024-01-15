import joi from "joi";

export const billValidator = joi.object({
  cart: joi.required(),
  paymentMethod: joi.string().required(),
  createdAt: joi.date().default(() => new Date()),
  status: joi.string().default("pending"),
});
