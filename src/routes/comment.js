import { Router } from "express";
import {
  createComment,
  deleteComment,
  deleteImage,
  getAllComments,
  getCommentsByProductId,
  likeComment,
  replyComment,
  updateComment,
  updateImage,
  uploadImage,
} from "../controllers/comment";
import { checkPermission } from "../middlewares/checkPermission";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../configs/cloudinary";
import multer from "multer";

const routerComment = Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "shoe_images",
    format: "png",
  },
});

const upload = multer({ storage });

routerComment.get("/all", checkPermission, getAllComments);
routerComment.post("/create", checkPermission, createComment);
routerComment.get("/:shoeId", getCommentsByProductId);
routerComment.patch("/patch", checkPermission, updateComment);
routerComment.delete("/delete", checkPermission, deleteComment);

routerComment.patch("/like", checkPermission, likeComment);
routerComment.post("/reply/:parent_id", checkPermission, replyComment);

routerComment.post("/image/upload", upload.array("images", 10), uploadImage);
routerComment.delete("/image/:publicId", deleteImage);
routerComment.patch("/image/update/:publicId", upload.array("images", 10), updateImage);

export default routerComment;
