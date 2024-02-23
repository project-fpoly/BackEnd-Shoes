import { Router } from "express";
import {
  createUser,
  deleteMoreUsers,
  
  forgotPassword,
  getAllUsers,
  getOneUser,
  resetPassword,
  sendEmail,
  signIn,
  signUp,
  updateUser,
  verifyEmail,
} from "../controllers/auth";
import {
  checkPermission,
  checkPermissionManager,
  checkPermissionMember,
} from "../middlewares/checkPermission";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "../configs/cloudinary";
// import multer from "multer";

const routerAuth = Router();
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "book",
//     format: async (req, file) => "png",
//   },
// });
// const upload = multer({ storage: storage });
routerAuth.post("/create",checkPermission, createUser);
routerAuth.post("/signup", signUp);
routerAuth.post("/signin", signIn);

// người quản lý mới có thể xem tất cả user và cập nhật
routerAuth.get("/users", checkPermissionManager, getAllUsers);

// routerAuth.put(
//   "/users/:userId",
//   upload.single("avt"),
//   checkPermissionManager,
//   updateUser
// );

routerAuth.put("/users/:userId", checkPermissionManager, updateUser);

//chỉ admin mới có quyền xoá hàng loạt
routerAuth.delete("/more-users", checkPermission, deleteMoreUsers);

// routerAuth.delete("/users/:userId", deleteUser);
routerAuth.get("/user/:userId", checkPermissionMember, getOneUser);
routerAuth.post("/forgot-password", checkPermissionMember, forgotPassword);
routerAuth.post("/reset-password", checkPermissionMember, resetPassword);

routerAuth.post("/send-email", sendEmail);
routerAuth.post("/verify-email", verifyEmail);
export default routerAuth;
