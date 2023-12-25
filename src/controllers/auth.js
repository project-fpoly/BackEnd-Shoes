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
    const accessToken = jwt.sign({ _id: user._id }, SECRET_CODE, {
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
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Người dùng không tồn tại.",
      });
    }

    const resetToken = crypto.randomBytes(50).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
      },
    });

    const origin = req.headers.origin || PORT_CLIENT;
    const resetPasswordLink = `${origin}/reset-password?token=${resetToken}&email=${email}`;

    const mailOptions = {
      from: GMAIL_USER,
      to: email,
      subject: "Reset Password",
      text: `Click on the following link to reset your password: ${resetPasswordLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({
          message: "Gửi email thất bại."+error,
        });
      }
      return res.status(200).json({
        message: "Đã gửi email với hướng dẫn reset mật khẩu.",
      });
    });
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });
    console.log(user);
    if (!user) {
      return res.status(400).json({
        message: "Token không hợp lệ hoặc đã hết hạn.",
      });
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    return res.status(200).json({
      message: "Mật khẩu đã được cập nhật.",
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
    const { error } = updateValidator.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({
        message: errors,
      });
    }
    const userId = req.params.userId;
    const updatedUser = req.body;

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        message: "Người dùng không tồn tại",
      });
    }

    existingUser.avt = updatedUser.avt || existingUser.avt;
    existingUser.gender = updatedUser.gender || existingUser.gender;
    existingUser.dateOfBirth =updatedUser.dateOfBirth || existingUser.dateOfBirth;

    //deliveryAddress
      if (updatedUser.deliveryAddress) {
        if (updatedUser.deliveryAddress.length > 3) {
          return res.status(400).json({
            message: "Chỉ được phép cung cấp tối đa 3 địa chỉ",
          });
        }
        const uniqueAddresses = [...new Set(updatedUser.deliveryAddress)];
        if (uniqueAddresses.length !== updatedUser.deliveryAddress.length) {
          return res.status(400).json({
            message: "Địa chỉ không được trùng lặp",
          });
        }
        for (const address of uniqueAddresses) {
          const addressExist = await User.findOne({
            "deliveryAddress.address": address,
            _id: { $ne: userId },
          });
          if (addressExist) {
            return res.status(400).json({
              message: `Địa chỉ ${address} đã được sử dụng bởi người dùng khác`,
            });
          }
        }
        existingUser.deliveryAddress = uniqueAddresses.map((address) => ({
          address,
        }));
      }
    //email
    if (updatedUser.email && updatedUser.email !== existingUser.email) {
      const emailExist = await User.findOne({
        email: updatedUser.email,
        _id: { $ne: userId },
      });
      if (emailExist) {
        return res.status(400).json({
          message: `Email ${updatedUser.email} đã được sử dụng bởi người dùng khác`,
        });
      }
      existingUser.email = updatedUser.email;
    }

    //phone
    if (updatedUser.phoneNumbers) {
      if (updatedUser.phoneNumbers.length > 3) {
        return res.status(400).json({
          message: "Chỉ được phép cung cấp tối đa 3 số điện thoại",
        });
      }
      const uniquePhoneNumbers = [...new Set(updatedUser.phoneNumbers)];
      if (uniquePhoneNumbers.length !== updatedUser.phoneNumbers.length) {
        return res.status(400).json({
          message: "Số điện thoại không được trùng lặp",
        });
      }
      for (const phoneNumber of uniquePhoneNumbers) {
        const phoneExist = await User.findOne({
          "phoneNumbers.phoneNumber": phoneNumber,
          _id: { $ne: userId },
        });
        if (phoneExist) {
          return res.status(400).json({
            message: `Số điện thoại ${phoneNumber} đã được sử dụng bởi người dùng khác`,
          });
        }
      }
      existingUser.phoneNumbers = uniquePhoneNumbers.map((phoneNumber) => ({
        phoneNumber,
      }));
    }

    const savedUser = await existingUser.save();

    // Không thể thay đổi user và tạm thời có cả password
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
