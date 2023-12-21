import { Router } from "express"
import { deleteUser, getAllUsers, signIn, signUp, updateUser } from "../controllers/auth"
import { checkPermission } from "../middlewares/checkPermission"

const routerAuth = Router()

routerAuth.post("/signup", signUp)
routerAuth.post("/signin", signIn)
routerAuth.get("/users", getAllUsers);
routerAuth.put("/users/:userId",updateUser);
//chỉ admin mới có quyền xoá
routerAuth.delete("/users/:userId",checkPermission, deleteUser);
export default routerAuth