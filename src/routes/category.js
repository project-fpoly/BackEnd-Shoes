import { Router } from "express"
import { createCategory, getAllCategory, removeCategory, updateCategory,getOneCategory } from "../controllers/category"

const routerCategory = Router()

routerCategory.get("/", getAllCategory);
routerCategory.get("/:id", getOneCategory);
routerCategory.post("/", createCategory);
routerCategory.put(`/:id`, updateCategory);
routerCategory.delete("/:id", removeCategory);

export default routerCategory