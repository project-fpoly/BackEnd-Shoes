import { signInValidator, signUpValidator } from "../validations/user";
import bcryptjs from "bcryptjs";
import User from "../models/User";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const { SECRET_CODE } = process.env;
export const signUp = async (req, res) => {
  try {
    const { error } = signUpValidator.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({
        messages: errors,
      });
    }
    const userExist = await User.findOne({ email: req.body.email });
    if (userExist) {
      return res.status(400).json({
        message: "Email này đã được đăng ký, bạn có muốn đăng nhập không?",
      });
    }
    const hashPassword = await bcryptjs.hash(req.body.password, 10);
    const user = await User.create({
      userName: req.body.userName,
      email: req.body.email,
      password: hashPassword,
    });
    user.password = undefined;
    return res.status(200).json({
      message: "Đăng ký thành công!",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      name: error.name || "Lỗi",
      message: error.message || "Lỗi server!",
    });
  }
};
export const signIn = async (req, res) => {
  try {
    const { error } = signInValidator.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({
        message: errors,
      });
    }
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        message: "Email này chưa đăng ký, bạn có muốn đăng ký không?",
      });
    }
    const isMatch = await bcryptjs.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Password không đúng, vui lòng kiểm tra lại!",
      });
    }
    const accessToken = jwt.sign({  _id: user._id }, SECRET_CODE, {
      expiresIn: "1d",
    });
    user.password = undefined;
    return res.status(200).json({
      message: "Đăng nhập thành công!",
      accessToken,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
};
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng.",
      });
    }

    user.password = undefined;
    
    return res.status(200).json({
      message: "Xoá người dùng thành công.",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
};
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    return res.status(200).json({
      users,
    });
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
};
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const updatedUser = req.body; 

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        message: "Người dùng không tồn tại",
      });
    }

    if (updatedUser.email && updatedUser.email !== existingUser.email) {
      const emailExist = await User.findOne({ email: updatedUser.email });
      if (emailExist) {
        return res.status(400).json({
          message: "Email đã được sử dụng",
        });
      }
    }

    existingUser.email = updatedUser.email || existingUser.email;

    const savedUser = await existingUser.save();

    //không thể thay đổi user và tạm thời có cả password
    savedUser.password = undefined; 
    savedUser.userName = undefined; 

    return res.status(200).json({
      message: "Cập nhật thông tin người dùng thành công",
      user: savedUser,
    });
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
};


