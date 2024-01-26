import Product from "../models/Product";
import productValidator from "../validations/Product";
import multer from "multer";
import Category from "../models/Category";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/product");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
});

const addProduct = async (req, res) => {
  try {
    const {
      product_id,
      SKU,
      name,
      description,
      categoryId,
  
      price,
      sale,
      discount,
      quantity,
      sold_count,
      rating,
      size,
      color,
      material,
      release_date,
      images,
      video,
      blog,
      warranty,
      tech_specs,
      stock_status,
      isPublished,
      publishedDate,
      hits,
    } = req.body;

    // Kiểm tra dữ liệu đầu vào sử dụng validator
    const validationResult = productValidator.validate(req.body);

    if (validationResult.error) {
      return res.status(400).json({
        status: "error",
        message: "Dữ liệu không hợp lệ",
        error: validationResult.error.details[0].message,
      });
    }

    // Kiểm tra sản phẩm trùng lặp
    const existingProduct = await Product.findOne({ product_id });
    if (existingProduct) {
      return res.status(409).json({
        status: "error",
        message: "Sản phẩm đã tồn tại",
      });
    }

    // Tiếp tục xử lý khi dữ liệu hợp lệ
    const newProduct = new Product({
      product_id,
      SKU,
      name,
      description,
      categoryId,
   
      price,
      sale,
      discount,
      quantity,
      sold_count,
      rating,
      size,
      color,
      material,
      release_date,
      images,
      video,
      blog,
      warranty,
      tech_specs,
      stock_status,
      isPublished,
      publishedDate,
      hits,
    });

    const saveProduct = await newProduct.save();

    await Promise.all([
      Category.findByIdAndUpdate(categoryId, {
        $push: { products: saveProduct._id },
      }),
    ]);

    res.status(200).json({
      status: "success",
      message: "Thêm sản phẩm thành công!",
      data: saveProduct,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};

const getAllProduct = async (req, res) => {
  const PAGE_SIZE = 12;
  const page = parseInt(req.query.page);
  const category = req.query.category;
  const sort = req.query.sort;
  const filter = req.query.filter;
  const color = req.query.color;
  const material = req.query.material;
  const releaseDate = req.query.releaseDate;
  const isPublished = req.query.isPublished;

  try {
   

    const skip = (page - 1) * PAGE_SIZE;

    let query = {};

    if (category) {
      query.categoryId = category;
    }
    if (filter) {
      query.name = { $regex: filter, $options: "i" };
    }

    if (color) {
      query.color = color;
    }

    if (material) {
      query.material = material;
    }

    if (releaseDate) {
      query.release_date = releaseDate;
    }

    if (isPublished) {
      query.isPublished = isPublished;
    }

    const products = await Product.find(query)
      .populate("categoryId", "name")
      .sort(sort)
      .skip(skip)
      .limit(PAGE_SIZE);

    const total = await Product.countDocuments(query);
    const last_page = Math.ceil(total / PAGE_SIZE);

    if (products.length === 0) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Lấy danh sách sản phẩm thành công",
      last_page: last_page,
      current_page: page,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lấy danh sách sản phẩm thất bại",
      error: error.message,
    });
  }
};
const getDetailProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm"
      });
    }

    res.status(200).json({
      message: "Lấy chi tiết sản phẩm thành công",
      data: product
    });

  } catch (error) {
    return res.status(500).json({
      message: "Lỗi hệ thống",
      error: error.message
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    // Kiểm tra sản phẩm có tồn tại
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm"
      });
    }

    // Cập nhật sản phẩm
    await product.updateOne({ $set: req.body });

    return res.status(200).json({
      message: "Cập nhật sản phẩm thành công!",
      data: product
    });

  } catch (error) {
    return res.status(500).json({
      message: "Lỗi hệ thống",
      error: error.message
    });
  }
};

const deleteProduct = async (req, res) => {
  try {

    // Kiểm tra sản phẩm có tồn tại
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm"
      });
    }

    // Xóa sản phẩm khỏi danh mục liên quan
    await Category.updateMany({ product: req.params.id }, { $pull: { product: req.params.id } });

    // Xóa sản phẩm   
    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Xóa sản phẩm thành công!",
      data: product
    });

  } catch (error) {
    return res.status(500).json({
      message: "Lỗi hệ thống",
      error: error.message
    });
  }
};

export {
  addProduct,
  getAllProduct,
  getDetailProduct,
  updateProduct,
  deleteProduct,
  upload,
};