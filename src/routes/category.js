import { Router } from "express"
import { createCategory, getAllCategory, removeCategory, updateCategory,getOneCategory } from "../controllers/category.js"
import { checkPermission } from "../middlewares/checkPermission.js";

const routerCategory = Router()

routerCategory.get("/", getAllCategory);
routerCategory.get("/:id", getOneCategory);
routerCategory.post("/", createCategory);
routerCategory.put(`/:id`, updateCategory);
routerCategory.delete("/:id",checkPermission, removeCategory);

export default routerCategory