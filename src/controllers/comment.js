import dotenv from "dotenv";
import Comment from "../models/Comment";
import {
  commentValidate,
  updateCommentValidate,
} from "../validations/comments";
import cloudinary from "../configs/cloudinary";
dotenv.config();

const { SECRET_CODE } = process.env;

export const createComment = async (req, res) => {
  try {
    const body = req.body;
    console.log("asdsaas", body);
    const { error } = commentValidate.validate(body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
    // check shoeId is exist?
    // const product = await products.findById(body.shoeId)
    // if(!product) {
    //     return res.status(404).json({
    //         message: "Product not found"
    //     })
    // }

    // get userId from header Token middleware
    const { _id } = req.user;
    console.log(req.user, _id);
    const data = await Comment.create({ ...body, userId: _id });
    return res.status(201).json({
      message: "Create Comment successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
};

export const getAllComments = async (req, res) => {
  try {
    const data = await Comment.find()
      .populate("likes")
      .populate({
        path: "parentId",
        populate: {
          path: "userId",
          select: "-__v",
        },
      })
      .populate(["userId"])
      .exec();
    return res.status(200).json({
      message: "Successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
};

export const getCommentsByProductId = async (req, res) => {
  try {
    const data = await Comment.find({ shoeId: req.params.shoeId });
    return res.status(200).json({
      message: data.length > 0 ? "Successfully" : "Not found comments",
      data: data.length > 0 ? data : undefined,
    });
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { _id } = req.user;
    console.log("user", req.user);
    const { error } = updateCommentValidate.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
    const data = await Comment.findByIdAndUpdate(
      req.body.commentId,
      { ...req.body, userId: _id },
      {
        new: true,
      }
    );
    console.log(data);
    return res.status(200).json({
      message: "updated comment successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const data = await Comment.findByIdAndDelete(req.body._id);
    return res.status(200).json({
      message: "deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
};

export const likeComment = async (req, res) => {
  const { commentId } = req.body;
  try {
    const liker = await Comment.findById(commentId);
    console.log("long xem di", liker, req.user);
    const isLike = liker.likes.includes(req.user._id);
    console.log("isLike", isLike);
    if (!isLike) {
      liker.likes.push(req.user._id);
    } else {
      liker.likes.remove(req.user._id);
    }
    await liker.save();
    return res.json(liker);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const replyComment = async (req, res) => {
  try {
    const body = req.body;
    console.log("body", body, req.params)
    const { error } = commentValidate.validate(body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
    // check shoeId is exist?
    // const product = await products.findById(body.shoeId)
    // if(!product) {
    //     return res.status(404).json({
    //         message: "Product not found"
    //     })
    // }
    
    // get userId from header Token middleware
    const { _id } = req.user;
    // console.log(req.user, _id);
    const result = await Comment.findById({
      _id: req.params.parent_id,
    });
    if (!result) {
      return res.status(400).json("Khong tim thay");
    }
    const data = await Comment.create({
      ...body,
      userId: _id,
      parentId: req.params.parent_id,
    });
    return res.status(201).json({
      message: "Reply comment successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
};


export const uploadImage = async (req, res) => {
  const files = req.files
  // console.log("files", JSON.stringify(files));
  if (!Array.isArray(files)) {
    return res.status(400).json({ error: "No files were uploaded" });
  }
  try {
    const uploadPromises = files.map((file) => {
      // Sử dụng Cloudinary API để upload file lên Cloudinary
      return cloudinary.uploader.upload(file.path)
    })
    // console.log("uploadPromises", uploadPromises);

    // Chờ cho tất cả các file đều được upload lên Cloudinary
    const results = await Promise.all(uploadPromises)
    console.log(results);

    // Trả về kết quả là 1 mảng các đối tượng chứa thông tin của các file đã được upload lên Cloudinary
    const uploadedFiles = results.map((result) => ({
      url: result.secure_url,
      publicId: result.public_id
    }))
    return res.json({ urls: uploadedFiles })

  } catch (error) {
    return res.status(500).json({
      error
    })
  }
}

export const deleteImage = async (req, res) => {
  const publicId = req.params.publicId
  console.log(publicId);
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return res.status(200).json({
      message: "Delete image successfully",
      result
    })
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error deleting image"
    })
  }
}

export const updateImage = async (req, res) => {
  const files = req.files
  if (!Array.isArray(files)) {
    return res.status(400).json({
      error: "No files were uploaded"
    })
  }

  const publicId = req.params.publicId // Lay id cua anh can cap nhat
  const newImage = req?.files[0]?.path // Lay duong dan cua anh moi

  try {
    // Upload anh moi len Cloudinary va xoa anh cu cung mot luc
    const [uploadResult, deleteResult] = await Promise.all([
      cloudinary.uploader.upload(newImage),
      cloudinary.uploader.destroy(publicId)
    ])

    // Tra ve ket qua voi url va publicId cua anh moi
    return res.json({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id
    })
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Error updating image"
    })
  }
}