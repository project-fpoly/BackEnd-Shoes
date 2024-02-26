import Joi from "joi";

export const categorySchema = Joi.object({
    name: Joi.string()
        .required()
        .messages({
            "string.empty": "Trường tên không được để trống",
            "any.required": "Trường tên là bắt buộc",
        }),
    description: Joi.string(),
    imageUrl: Joi.string(),
    status: Joi.string().valid("active", "inactive").default("active"),
    viewCount: Joi.number().default(0),
});

export default categorySchema;