import Joi from "joi"

export const categorySchema = Joi.object({
    name: Joi.string().required().messages({
        "string.empty": 'Trường tên không được để trống',
        "any.required": 'Trường tên là bắt buộc',
    }),
    // name: Joi.string().required().min(3).max(255),

})

export default categorySchema