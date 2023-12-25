import Joi from "joi";

export const cartItemSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Tên không được để trống",
    "any.required": "Tên là trường bắt buộc",
  }),
  quantity: Joi.number().min(0).max(10).required().messages({
    "number.empty": "Số lượng không được để trống",
    "number.min": "Số lượng tối thiểu là {#limit}",
    "number.max": "Số lượng tối đa là {#limit}",
  }),
  image: Joi.string().required().messages({
    "string.empty": "Hình ảnh không được để trống",
    "any.required": "Hình ảnh là trường bắt buộc",
  }),
  price: Joi.number().required().messages({
    "number.empty": "Giá không được để trống",
    "any.required": "Giá là trường bắt buộc",
  }),
  shoes: Joi.required(),
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
  city: Joi.string().required().messages({
    "string.empty": "Thành phố không được để trống",
    "any.required": "Thành phố là trường bắt buộc",
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
  itemsPrice: Joi.number().required(),
  shippingPrice: Joi.number().required(),
  totalPrice: Joi.number().required(),
  user: Joi.required(),
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
