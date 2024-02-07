import Joi from "joi";

const cartItemSchema = Joi.object({
  product: Joi.string().required(),
  quantity: Joi.number().required(),
  price: Joi.number().optional(),
  images: Joi.array().optional(),
});

const cartSchema = Joi.object({
  cartItems: Joi.array().items(cartItemSchema),
  shippingAddress: Joi.object({
    email: Joi.string().email().required(),
    fullname: Joi.string().required(),
    address: Joi.string().required(),
    phone: Joi.number().required(),
  }),
  user: Joi.string().optional(),
  totalPrice: Joi.number().default(0),
});

const validateCart = (cart) => cartSchema.validate(cart);

export { validateCart };
