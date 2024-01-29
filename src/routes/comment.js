import { Router } from "express";
import {
  createComment,
  deleteComment,
  deleteImage,
  getAllComments,
  likeComment,
  replyComment,
  updateComment,
  updateImage,
  uploadImage,
} from "../controllers/comment";
import { checkPermission, checkPermissionMember } from "../middlewares/checkPermission";
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
routerComment.post("/create", checkPermissionMember, createComment);
routerComment.patch("/patch", checkPermissionMember, updateComment);
routerComment.delete("/delete/:_id", checkPermissionMember, deleteComment);

routerComment.patch("/like", checkPermissionMember, likeComment);
routerComment.post("/reply/:parent_id", checkPermission, replyComment);

routerComment.post("/image/upload", upload.array("images", 10), uploadImage);
routerComment.delete("/image/:publicId", deleteImage);
routerComment.patch("/image/update/:publicId", upload.array("images", 10), updateImage);

export default routerComment;
