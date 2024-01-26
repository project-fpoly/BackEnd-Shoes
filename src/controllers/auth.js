import {
  signInValidator,
  signUpValidator,
  updateValidator,
} from "../validations/user";
import bcryptjs from "bcryptjs";
import User from "../models/User";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const { SECRET_CODE, PORT_CLIENT, GMAIL_USER, GMAIL_PASS } = process.env;
const generateVerificationToken = () => {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
};
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
});


export const signUp = async (req, res) => {
  try {
    const { error } = signUpValidator.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({
        message: errors,
      });
    }

    const email = await User.findOne({ email: req.body.email });
    if (!email) {
      const hashPassword = await bcryptjs.hash(req.body.password, 10);
      const newUser = new User({
        userName: req.body.userName,
        email: req.body.email,
        password: hashPassword,
      });
      const verificationToken = generateVerificationToken();
      const verificationExpiry = new Date();
      verificationExpiry.setMinutes(verificationExpiry.getMinutes() + 30);

      newUser.emailVerificationToken = verificationToken;
      newUser.emailVerificationExpiry = verificationExpiry;

      // Lưu thông tin xác thực vào cơ sở dữ liệu
      await newUser.save();

      const mailOptions = {
        from: "your-email@example.com",
        to: newUser.email,
        subject: "Xác thực tài khoản",
        text: `Mã xác thực của bạn là: ${verificationToken}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        console.log("Email sent: " + info.response);
        res.status(200).json({
          message: "Đăng ký thành công. Kiểm tra email để xác thực tài khoản.",
        });
      });
    } else {
      return res.status(400).json({
        message: "Email đã tồn tại.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
};

export const verifyEmail = async (req, res) => {
  const { userName, emailVerificationToken } = req.body;

  try {
    const user = await User.findOne({ userName, emailVerificationToken });

    if (!user) {
      return res.status(400).json({ error: "Invalid verification token." });
    }

    // Kiểm tra thời hạn xác thực
    if (user.emailVerificationExpiry < new Date()) {
      return res.status(400).json({ error: "Verification token has expired." });
    }

    // Đánh dấu email đã được xác thực
    user.emailVerified = true;
    await user.save();

    res.json({ message: "Email verified successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
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
      // user,
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
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const searchKeyword = req.query.search || "";
    const roleFilter = req.query.role || "";

    const options = {
      page,
      limit: pageSize,
      select: { password: 0 },
    };
    const searchCondition = {
      $or: [
        { userName: { $regex: searchKeyword, $options: "i" } },
        { email: { $regex: searchKeyword, $options: "i" } },
      ],
    };
    if (roleFilter) {
      searchCondition.role = roleFilter;
    }
    const users = await User.paginate(searchCondition, options);

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
};

export const getOneUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(403).json({
        message: "Bạn chưa đăng nhập!",
      });
    }
    const decoded = jwt.verify(token, SECRET_CODE);
    const userId = decoded._id;

    const projection = {
      password: 0,
      _id: 0,
      emailVerified: 0,
      role: 0,
      emailVerificationToken: 0,
      emailVerificationExpiry: 0,
      updatedAt: 0,
      resetToken: 0,
      resetTokenExpiry: 0,
    };

    const user = await User.findById(userId, projection);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      user,
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
    existingUser.dateOfBirth =
      updatedUser.dateOfBirth || existingUser.dateOfBirth;

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

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Người dùng không tồn tại.",
      });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

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
          message: "Gửi email thất bại." + error,
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
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(403).json({
        message: "Bạn chưa đăng nhập!",
      });
    }
    const decoded = jwt.verify(token, SECRET_CODE);
    const userId = decoded._id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng.",
      });
    }

    return res.status(200).json({
      message: "Xoá người dùng thành công.",
      decoded,
    });
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
};

export const deleteMoreUsers = async (req, res) => {
  try {
    const userIdsToDelete = req.body.userIds;
    if (!userIdsToDelete || userIdsToDelete.length === 0) {
      return res.status(400).json({
        message: "Vui lòng cung cấp ít nhất một ID người dùng để xoá.",
      });
    }

    const deletedUsers = await User.deleteMany({
      _id: { $in: userIdsToDelete },
    });

    if (deletedUsers.deletedCount === 0) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng nào để xoá.",
      });
    }

    return res.status(200).json({
      message: "Xoá người dùng thành công.",
      deletedCount: deletedUsers.deletedCount,
    });
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
};
