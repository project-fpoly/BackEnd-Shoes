import { Router } from "express";
import { createNotification, deleteNotification, getAllNotifications } from "../controllers/notification";

const routerNotification = Router();

// Lấy tất cả thông báo
routerNotification.get("/all", getAllNotifications);

// Tạo mới thông báo
routerNotification.post("/create",createNotification);

// Cập nhật thông báo
// Giành cho admin khi muốn gửi thông báo cho user hoặc manager
// routerNotification.patch("/update/:notificationId", checkPermissionMember, updateNotification);

// Xóa thông báo
routerNotification.delete("/delete/:notificationId", deleteNotification);

export default routerNotification;
