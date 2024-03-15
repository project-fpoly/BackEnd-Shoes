import Joi from "joi";

export const VoucherValidator = Joi.object({
    Name: Joi.string().required(),
    Quantity: Joi.number().required().min(0),
    reduced_amount: Joi.number().required().min(0).max(100),
    price_order: Joi.number().required().min(0),
    description: Joi.string().required().min(6).max(255),
    expiration_date: Joi.date(),
});
