import { Router } from "express"
import { deleteUser, getAllUsers, signIn, signUp, updateUser } from "../controllers/auth"

const routerAuth = Router()

routerAuth.post("/signup", signUp)
routerAuth.post("/signin", signIn)
routerAuth.get("/users", getAllUsers);
routerAuth.delete("/users/:userId", deleteUser);
routerAuth.put("/users/:userId", updateUser);
export default routerAuth