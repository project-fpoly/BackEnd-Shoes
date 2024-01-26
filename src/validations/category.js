import Joi from "joi"

export const categorySchema = Joi.object({
<<<<<<< HEAD
    name: Joi.string().required().messages({
        "string.empty": 'Trường tên không được để trống',
        "any.required": 'Trường tên là bắt buộc',
    }),
=======
>>>>>>> 3e501ee78c00fa509e2e9d8bb5dae3f2ffe53ed7
    name: Joi.string().required().min(3).max(255),

})

export default categorySchema