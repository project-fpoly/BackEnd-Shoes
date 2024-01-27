import Joi from "joi";

const productValidator = Joi.object({
  product_id: Joi.string().required(),
  SKU: Joi.string(),
  name: Joi.string(),
  description: Joi.string().required(),
  categoryId: Joi.string().allow(null).optional(),
  price: Joi.number().min(0).required(),
  sale: Joi.number().min(0).default(0),
  discount: Joi.number(),
  quantity: Joi.number().min(0).required(),
  sold_count: Joi.number().default(0),
  rating: Joi.number(),
  size: Joi.string(),
  color: Joi.string().valid("red", "green", "blue", "yellow", "black", "white"),
  material: Joi.string(),
  release_date: Joi.date(),
  images: Joi.array().items(Joi.string()),
  video: Joi.string(),
  blog: Joi.string().allow(null).optional(),
  warranty: Joi.string(),
  tech_specs: Joi.string(),
  stock_status: Joi.string(),
  isPublished: Joi.boolean().default(false),
  publishedDate: Joi.date(),
  hits: Joi.number().default(0),
});

export default productValidator;