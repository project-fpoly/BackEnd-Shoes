import Product from "../models/Product";
import productValidator from "../validations/Product";
import multer from "multer";
import Category from "../models/Category";
import { isValid } from "date-fns";
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
      sizes,
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
      sizes,
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
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const searchKeyword = req.query.searchKeyword || "";
    const categoryFilter = req.query.categoryFilter || "";
    const sizeFilter = req.query.sizeFilter || "";
    const priceFilter = req.query.priceFilter || "";
    const materialFilter = req.query.materialFilter || "";
    const releaseDateFilter = req.query.releaseDateFilter || "";
    const sortOrder = req.query.sortOrder;

    const options = {
      page,
      limit: pageSize,
    };

    const searchKeywordRegex = new RegExp(searchKeyword, "i");

    let searchCondition = {
      $or: [
        { name: searchKeywordRegex },
      ],
    };

    if (categoryFilter) {
      searchCondition.categoryId = categoryFilter;
    }

    if (sizeFilter) {
      searchCondition["sizes.name"] = sizeFilter;
    }

    if (priceFilter) {
      const [minPrice, maxPrice] = priceFilter.split("->");
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        searchCondition.price = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
      } else {
        return res.status(400).json({
          message: "Giá trị minPrice hoặc maxPrice không hợp lệ",
          data: [],
        });
      }
    }

    if (materialFilter) {
      searchCondition.material = materialFilter;
    }

    if (releaseDateFilter) {
      const [startDate, endDate] = releaseDateFilter.split("->");
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);

      if (isValid(parsedStartDate) && isValid(parsedEndDate)) {
        searchCondition.release_date = { $gte: parsedStartDate, $lte: parsedEndDate };
      } else {
        return res.status(400).json({
          message: "Giá trị startDate hoặc endDate không hợp lệ",
          data: [],
        });
      }
    }

    const sortOptions = {};
    if (sortOrder === "asc") {
      sortOptions.price = 1;
    } else if (sortOrder === "desc") {
      sortOptions.price = -1;
    } else {
      sortOptions.price = 0;
    }

    const products = await Product.paginate(searchCondition, options);

    if (products.docs.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm nào",
        data: [],
      });
    }

    const productIds = products.docs.map((product) => product._id);

    let populatedProducts = {};

    if (sortOptions.price === 0) {
      populatedProducts = await Product.find({ _id: { $in: productIds } }).populate("categoryId", "name");
    } else {
      populatedProducts = await Product.find({ _id: { $in: productIds } }).populate("categoryId", "name").sort(sortOptions);
    }
   

    let successMessage = "Hiển thị danh sách sản phẩm thành công.";

    if (searchKeyword) {
      successMessage += " Bạn đã tìm kiếm: " + searchKeyword +";";
    }

    if (categoryFilter) {
      successMessage += " Bạn đã chọn danh mục: " + categoryFilter +";";
    }

    if (sizeFilter) {
      successMessage += " Bạn đã chọn kích thước: " + sizeFilter +";";
    }

    if (priceFilter) {
      successMessage += " Bạn đã chọn mức giá: " + priceFilter +";";
    }

    if (materialFilter) {
      successMessage += " Bạn đã chọn chất liệu: " + materialFilter +";";
    }

    if (releaseDateFilter) {
      successMessage += " Bạn đã chọn khoảng thời gian phát hành: " + releaseDateFilter +";";
    }

    let sortOrderMessage = "";
    if (sortOrder === "asc") {
      sortOrderMessage = "tăng dần";
    } else if (sortOrder === "desc") {
      sortOrderMessage = "giảm dần";
    } else {
      sortOrderMessage = "mặc định";
    }

    successMessage += " Bạn đã chọn thứ tự sắp xếp theo giá: " + sortOrderMessage;

    return res.status(200).json({
      message: successMessage,
      totalProducts: products.totalDocs,
      totalPages: products.totalPages,
      currentPage: products.page,
      data: populatedProducts,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi hiển thị danh sách sản phẩm.",
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