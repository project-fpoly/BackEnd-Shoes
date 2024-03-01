import { Router } from "express";
import { createNotification, deleteNotification, getAllNotifications, getOneNotifications, getUserNotifications, updateNotification } from "../controllers/notification";
import { checkPermission, checkPermissionMember } from "../middlewares/checkPermission";

const routerNotification = Router();

// Lấy tất cả thông báo
routerNotification.get("/all", getAllNotifications);
routerNotification.get("/one/:notificationId", getOneNotifications);
routerNotification.get("/all/user",checkPermissionMember, getUserNotifications);

// Tạo mới thông báo
routerNotification.post("/create",createNotification);

// Cập nhật thông báo
// Giành cho admin khi muốn gửi thông báo cho user hoặc manager
routerNotification.put("/update/:notificationId", checkPermissionMember, updateNotification);

// Xóa thông báo
routerNotification.delete("/delete/:notificationId", deleteNotification);

export default routerNotification;
