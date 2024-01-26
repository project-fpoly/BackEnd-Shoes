import Category from "../models/Category";
import { categorySchema } from "../validations/category";
import dotenv from "dotenv";
dotenv.config();

const { SECRET_CODE } = process.env;

export const getAllCategory = async (req, res) => {
    try {
        const options = { page: 1, limit: 10 };
        const data = await Category.paginate({}, options);
        if (!data || data.docs.length === 0) {
            throw new Error("Failed");
        }

        return res.status(200).json({
            message: "Success",
            data,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

export const getOneCategory = async function (req, res) {
    try {
        const category = await Category.findById(req.params.id).populate("products");
        if (!category) {
            return res.json({
                message: "Không có danh mục nào",
            });
        }
        return res.status(200).json({
            message: "thành công",
            data: category
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

export const createCategory = async (req, res) => {
    try {
        const body = req.body;
        const { error } = categorySchema.validate(body);
        if (error) {
            return res.status(400).json({
                message: error.details[0].message,
            });
        }
        const data = await Category.create(body);
        if (!data) {
            throw new Error("Failed");
        }

        return res.status(200).json({
            message: "Success",
            datas: data,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const body = req.body;
        const id = req.params.id;

        const { error } = categorySchema.validate(body);
        if (error) {
            return res.status(400).json({
                message: error.details[0].message,
            });
        }
        const data = await Category.findByIdAndUpdate(id, body, { new: true });
        if (!data) {
            return res.status(404).json({
                message: "Cập nhật danh mục thất bại!",
            });
        }

        return res.status(200).json({
            message: "Cập nhật danh mục thành công!",
            datas: data,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

export const removeCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Category.findByIdAndDelete(id);
        if (!data) {
            return res.status(404).json({
                message: "Xoá danh mục thất bại!",
            });
        }

        return res.status(200).json({
            message: "Xoá danh mục thành công!",
            data,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Xoá danh mục thất bại!",
        });
    }
};

