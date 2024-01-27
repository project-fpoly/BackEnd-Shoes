import { Router } from "express"
import { deleteMoreUsers, deleteUser, forgotPassword, getAllUsers, getOneUser, resetPassword,  sendEmail,  signIn, signUp, updateUser, verifyEmail } from "../controllers/auth"
import { checkPermission, checkPermissionManager, checkPermissionMember } from "../middlewares/checkPermission"

const routerAuth = Router();

routerAuth.post("/signup", signUp)
routerAuth.post("/signin", signIn)

// người quản lý mới có thể xem tất cả user và cập nhật
routerAuth.get("/users",checkPermissionManager, getAllUsers);
routerAuth.put("/users/:userId",checkPermissionManager,updateUser);

//chỉ admin mới có quyền xoá hàng loạt
routerAuth.delete("/more-users", checkPermission, deleteMoreUsers);


routerAuth.delete("/users",checkPermissionMember, deleteUser);
routerAuth.get("/user",checkPermissionMember,getOneUser)
routerAuth.post("/forgot-password",checkPermissionMember, forgotPassword);
routerAuth.post("/reset-password",checkPermissionMember,resetPassword);

routerAuth.post("/send-email",sendEmail);
routerAuth.post("/verify-email",verifyEmail);
export default routerAuth