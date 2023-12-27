import joi from "joi";

export const billValidator = joi.object({
  user: joi.string().required(),
  shoes: joi.string().required(),
  createdAt: joi.date().default(() => new Date()),
  paymentMethod: joi.string().required(),
  totalPrice: joi.number().min(0).required(),
  quantity: joi.number().min(0).required(),
  image: joi.string().default(null),
  dateBuy: joi.date(),
  addRess: joi.string().min(5),
});
