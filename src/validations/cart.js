import Joi from "joi";

export const cartItemSchema = Joi.object({
  product: Joi.required(),
  quantity: Joi.number().min(1).required(),
});

export const shippingAddressSchema = Joi.object({
  fullname: Joi.string().required().messages({
    "string.empty": "Họ và tên không được để trống",
    "any.required": "Họ và tên là trường bắt buộc",
  }),
  address: Joi.string().required().messages({
    "string.empty": "Địa chỉ không được để trống",
    "any.required": "Địa chỉ là trường bắt buộc",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email không được để trống",
    "any.required": "Email là trường bắt buộc",
  }),
  phone: Joi.number().required().messages({
    "number.empty": "Số điện thoại không được để trống",
    "any.required": "Số điện thoại là trường bắt buộc",
  }),
});

export const cartSchema = Joi.object({
  cartItem: Joi.array().items(cartItemSchema).required(),
  shippingAddress: shippingAddressSchema.required(),
  paymentMethod: Joi.string().required(),
  shippingPrice: Joi.number().required(),
  totalPrice: Joi.number().required(),
  user: Joi.allow(null),
  isPaid: Joi.boolean().default(false),
  paidAt: Joi.date(),
  isDelivered: Joi.string()
    .valid(
      "Chờ xác nhận",
      "Chờ lấy hàng",
      "Đang giao",
      "Đánh giá",
      "Đã giao",
      "Đã hủy",
      "Trả hàng"
    )
    .default("Chờ xác nhận"),
  deliveredAt: Joi.date(),
});
