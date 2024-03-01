import Notification from "../models/Notification";
import { validationResult } from "express-validator";

// Lấy tất cả thông báo
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Đã xảy ra lỗi khi lấy thông báo",
        error: error.message,
      });
  }
};
export const getOneNotifications = async (req, res) => {
  try {
    const id= req.params.notificationId
    const notifications = await Notification.findById(id);
    res.status(200).json(notifications);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Đã xảy ra lỗi khi lấy thông báo",
        error: error.message,
      });
  }
};

// Lấy thông báo theo user
export const getUserNotifications = async (req, res) => {
  try {
    const { _id } = req.user;
    const notifications = await Notification.find({ userId: _id });
     res.status(200).json(notifications);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Đã xảy ra lỗi khi lấy thông báo",
        error: error.message,
      });
  }
};

export const createNotificationForAdmin = async (message, type,_id) => {
  try {
    const newNotification = new Notification({
      userId: _id,
      message,
      type,
      isRead: false,
      recipientType: "admin",
    });

    await newNotification.save();
  } catch (error) {
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi tạo thông báo cho admin",
      error: error.message
    });
  }
};
// Tạo mới thông báo
export const createNotification = async (req, res) => {
  const { userId, message, type, isRead, recipientType } = req.body;

  try {
    // Validate dữ liệu
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newNotification = new Notification({
      userId,
      message,
      type,
      isRead: isRead || false,
      recipientType,
    });

    const savedNotification = await newNotification.save();
    res.status(201).json(savedNotification);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Đã xảy ra lỗi khi tạo mới thông báo",
        error: error.message,
      });
  }
};

// Xóa thông báo
export const deleteNotification = async (req, res) => {
  const notificationId = req.params.notificationId;

  try {
    const deletedNotification = await Notification.findByIdAndRemove(
      notificationId
    );
    if (!deletedNotification) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông báo để xóa" });
    }

    res
      .status(200)
      .json({ message: "Xóa thông báo thành công", deletedNotification });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Đã xảy ra lỗi khi xóa thông báo",
        error: error.message,
      });
  }
};
export const updateNotification = async (req, res) => {
  const notificationId = req.params.notificationId;

  try {
    // Tìm thông báo theo ID
    const notification = await Notification.findById(notificationId);

    // Kiểm tra xem thông báo có tồn tại không
    if (!notification) {
      return res.status(404).json({ message: "Không tìm thấy thông báo" });
    }

    // Cập nhật trạng thái isRead thành true
    notification.isRead = true;

    // Lưu thông báo đã được cập nhật
    await notification.save();

    res.status(200).json({ message: "Cập nhật thông báo thành công", updatedNotification: notification });
  } catch (error) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi cập nhật thông báo",
      error: error.message,
    });
  }
};