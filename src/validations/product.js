import Joi from "joi";

const productValidator = Joi.object({
  product_id: Joi.string().required(),
  SKU: Joi.string(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  categoryId: Joi.string().allow(null).optional().required(),
  price: Joi.number().min(0).required(),
  sale: Joi.string().allow(null).optional().required(),
  discount: Joi.number(),
  quantity: Joi.number().min(0).required(),
  sold_count: Joi.number().default(0),
  rating: Joi.number().required(),
  sizes: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      quantity: Joi.number().min(0).required(),
    })
  ),
  color: Joi.string().valid("red", "green", "blue", "yellow", "black", "white").required(),
  material: Joi.string().required(),
  release_date: Joi.date(),
  images: Joi.array().items(Joi.string()),
  video: Joi.string().required(),
  blog: Joi.string().allow(null).optional(),
  warranty: Joi.string().required(),
  tech_specs: Joi.string().required(),
  stock_status: Joi.string().required(),
  gender: Joi.string().required(),
  isPublished: Joi.boolean().default(false),
  publishedDate: Joi.date(),
  hits: Joi.number().default(0),
  isDeleted: Joi.boolean().default(false),
});

export default productValidator;