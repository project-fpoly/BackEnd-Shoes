import Product from "../models/Product.js";
import productValidator from "../validations/product.js";
import multer from "multer";
import Category from "../models/Category.js";
import { isValid } from "date-fns";
import Notification from "../models/Notification.js";
import { createNotificationForAdmin } from "./notification.js";
import Sale from "../models/Sale.js";
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
      product_id, SKU, name, description, categoryId, price, sale, discount, quantity, sold_count, rating,
      sizes, color, material, release_date, images, video, blog, warranty, tech_specs, stock_status, gender, isPublished, publishedDate, hits,
    } = req.body;

    // Kiểm tra dữ liệu đầu vào sử dụng validator
    const validationResult = productValidator.validate(req.body, {
      abortEarly: false,
    });;

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
      product_id, SKU, name, description, categoryId, price, sale, discount, quantity, sold_count, rating,
      sizes, color, material, release_date, images, video, blog, warranty, tech_specs, stock_status, gender, isPublished, publishedDate, hits,
    });

    const saveProduct = await newProduct.save();

    await Category.findByIdAndUpdate(categoryId, {
      $push: { products: saveProduct._id },
    });

    if (sale) {
      await Sale.findByIdAndUpdate(sale, {
        $push: { product: saveProduct._id },
      });
    }

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
// getAll
const getAllProduct = async (req, res) => {
  try {
    const { page, pageSize, searchKeyword, categoryFilter, sizeFilter, priceFilter, materialFilter, releaseDateFilter, colorFilter, genderFilter, deleteFilter, sortOrder } = req.query;

    const options = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(pageSize, 10) || 10,
    };

    const searchCondition = buildSearchCondition(searchKeyword, categoryFilter, sizeFilter, priceFilter, materialFilter, releaseDateFilter, colorFilter, genderFilter, deleteFilter);
    const sortOptions = buildSortOptions(sortOrder);

    const { products, total } = await getProductsWithPagination(searchCondition, options);
    const totalPages = Math.ceil(total / options.limit);

    if (products.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm nào",
        data: [],
      });
    }
    const productIds = products.map((product) => product._id);
    let populatedProducts = {};
    populatedProducts = await Product.find({ _id: { $in: productIds } }).populate("categoryId", "name").populate("sale", "Name discout").sort(sortOptions);
    const result = buildResult(populatedProducts, total, options.page, totalPages, options.limit);

    let successMessage = "Hiển thị danh sách sản phẩm thành công.";

    if (searchKeyword) {
      successMessage += " Bạn đã tìm kiếm: " + searchKeyword + ";";
    }

    if (categoryFilter) {
      successMessage += " Bạn đã chọn danh mục: " + categoryFilter + ";";
    }

    if (sizeFilter) {
      successMessage += " Bạn đã chọn kích thước: " + sizeFilter + ";";
    }

    if (priceFilter) {
      successMessage += " Bạn đã chọn mức giá: " + priceFilter + ";";
    }

    if (materialFilter) {
      successMessage += " Bạn đã chọn chất liệu: " + materialFilter + ";";
    }

    if (releaseDateFilter) {
      successMessage += " Bạn đã chọn khoảng thời gian phát hành: " + releaseDateFilter + ";";
    }

    if (colorFilter) {
      successMessage += " Bạn đã chọn màu sắc của sản phẩm là: " + colorFilter + ";";
    }

    if (genderFilter) {
      successMessage += " Bạn đã chọn giới tính là: " + genderFilter + ";";
    }

    let sortOrderMessage = "";
    switch (sortOrder) {
      case "asc":
        sortOrderMessage = "giá tăng dần";
        break;
      case "desc":
        sortOrderMessage = "giá giảm dần";
        break;
      case "asc_views":
        sortOrderMessage = "lượt xem tăng dần";
        break;
      case "desc_views":
        sortOrderMessage = "lượt xem giảm dần";
        break;
      case "asc_sold":
        sortOrderMessage = "số lượng đã bán tăng dần";
        break;
      case "desc_sold":
        sortOrderMessage = "số lượng đã bán giảm dần";
        break;
      case "asc_sale":
        sortOrderMessage = "Số % khuyến mãi giá bán tăng dần";
        break;
      case "desc_sale":
        sortOrderMessage = "Số % khuyến mãi giá bán giảm dần";
        break;
      case "asc_rate":
        sortOrderMessage = "Số lượt đánh giá sản phẩm tăng dần";
        break;
      case "desc_rate":
        sortOrderMessage = "Số lượt đánh giá sản phẩm giảm dần";
        break;
      case "asc_release_date":
        sortOrderMessage = "Ngày ra mắt tăng dần";
        break;
      case "desc_release_date":
        sortOrderMessage = "Ngày ra mắt giảm dần";
        break;
      default:
        sortOrderMessage = "mặc định";
        break;
    }

    successMessage += " Bạn đã chọn thứ tự sắp xếp theo: " + sortOrderMessage;

    res.status(200).json({
      message: successMessage,
      totalProducts: result.totalDocs,
      totalPages: result.totalPages,
      pageSize: result.pageSize,
      page: result.page,
      data: {
        colors: result.colors,
        materials: result.materials,
        tech_specs: result.tech_specs,
        sizes: result.sizes,
        products: result.products,
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Đã có lỗi xảy ra",
      data: [],
    });
  }
};
const buildSearchCondition = (searchKeyword, categoryFilter, sizeFilter, priceFilter,
   materialFilter, releaseDateFilter, colorFilter, genderFilter, deleteFilter, categoryNameFilter) => {
  const searchKeywordRegex = new RegExp(searchKeyword || "", "i");
  let searchCondition = {
    $or: [{ name: searchKeywordRegex }],
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
      throw new Error("Giá trị minPrice hoặc maxPrice không hợp lệ");
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
      throw new Error("Giá trị startDate hoặc endDate không hợp lệ");
    }
  }

  if (colorFilter) {
    searchCondition.color = colorFilter;
  }

  if (genderFilter) {
    searchCondition.gender = genderFilter;
  }

  if (deleteFilter) {
    searchCondition.isDeleted = deleteFilter;
  }
  if (categoryNameFilter) {
    searchCondition["category.name"] = categoryNameFilter; 
  }

  return searchCondition;
};

const buildSortOptions = (sortOrder) => {
  const sortOptions = {};
  if (sortOrder === "asc") {
    sortOptions.price = 1;
  } else if (sortOrder === "desc") {
    sortOptions.price = -1;
  } else if (sortOrder === "asc_views") {
    sortOptions.views = 1;
  } else if (sortOrder === "desc_views") {
    sortOptions.views = -1;
  } else if (sortOrder === "asc_sold") {
    sortOptions.sold = 1;
  } else if (sortOrder === "desc_sold") {
    sortOptions.sold = -1;
  } else if (sortOrder === "asc_sale") {
    sortOptions.sale = 1;
  } else if (sortOrder === "desc_sale") {
    sortOptions.sale = -1;
  } else if (sortOrder === "asc_rate") {
    sortOptions.rating = 1;
  } else if (sortOrder === "desc_rate") {
    sortOptions.rating = -1;
  } else if (sortOrder === "asc_release_date") {
    sortOptions.release_date = 1;
  } else if (sortOrder === "desc_release_date") {
    sortOptions.release_date = -1;
  } else {
    sortOptions.price = 0;
  }

  return sortOptions;
};

const getProductsWithPagination = async (searchCondition, options) => {
  const products = await Product.find(searchCondition)
    .skip((options.page - 1) * options.limit)
    .limit(options.limit)
    .exec();

  const total = await Product.countDocuments(searchCondition).exec();

  return { products, total };
};

const buildResult = (populatedProducts, total, page, totalPages, pageSize) => {
  const materials = populatedProducts.map((product) => product.material);
  const colors = populatedProducts.map((product) => product.color);
  const tech_specs = populatedProducts.map((product) => product.tech_specs);
  const stockStatuses = populatedProducts.map((product) => product.stock_status);
  const allSizes = [];
  populatedProducts.forEach(product => {
    product.sizes.forEach(size => {
      if (!allSizes.includes(size.name)) {
        allSizes.push(size.name);
      }
    });
  });

  const result = {
    page: page,
    totalDocs: total,
    totalPages: totalPages,
    pageSize: pageSize,
    materials: Array.from(new Set(materials)),
    colors: Array.from(new Set(colors)),
    stockStatuses: Array.from(new Set(stockStatuses)),
    products: populatedProducts,
    tech_specs: Array.from(new Set(tech_specs)),
    sizes: allSizes,
  };

  return result;
};

// GetDetail
const getDetailProduct = async (req, res) => {
  try {
    // Tìm sản phẩm theo ID
    const product = await Product.findById(req.params.id).populate("categoryId", "name").populate("sale", "Name discout");

    if (!product) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm"
      });
    }

    if (product.sale) {
      const saleInfo = await Sale.findById(product.sale);
      if (saleInfo) {
        const saleObject = {
          _id: saleInfo._id,
          name: saleInfo.Name,
          discount: saleInfo.discout
        };
        product.sale = saleObject;
      } else {
        product.sale = {
          _id: "0",
          name: "Không có thông tin giảm giá",
          discount: 0
        };
      }
    }

    // Trả về thông tin chi tiết sản phẩm
    res.status(200).json({
      message: "Lấy chi tiết sản phẩm thành công",
      data: product,
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
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm"
      });
    }

    // Cập nhật thông tin sản phẩm
    await Product.findByIdAndUpdate(req.params.id, { $set: req.body });

    await Category.updateMany({ products: req.params.id }, { $pull: { products: req.params.id } });
    await Sale.updateMany({ product: req.params.id }, { $pull: { product: req.params.id } });

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
const tryDeleteProduct = async (req, res) => {
  try {
    // Kiểm tra sản phẩm có tồn tại
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm"
      });
    }

    // Thay đổi trường 'delete' thành true
    product.isDeleted = true;

    // Cập nhật sản phẩm
    await product.save();

    return res.status(200).json({
      message: "Đã xóa tạm thời!",
      data: product
    });

  } catch (error) {
    return res.status(500).json({
      message: "Lỗi hệ thống",
      error: error.message
    });
  }
};

const RestoreProduct = async (req, res) => {
  try {
    // Kiểm tra sản phẩm có tồn tại
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm"
      });
    }


    product.isDeleted = false;

    // Cập nhật sản phẩm
    await product.save();

    return res.status(200).json({
      message: "Đã xóa tạm thời!",
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
    await Category.updateMany({ products: req.params.id }, { $pull: { products: req.params.id } });
    await Sale.updateMany({ product: req.params.id }, { $pull: { product: req.params.id } });

    // Xóa sản phẩm   
    await Product.findByIdAndDelete(req.params.id);

    // Thêm thông báo cho admin
    await createNotificationForAdmin(`Sản phẩm ${product.name} đã bị xoá bởi ${req.user.email}`, "product", req.user._id, "admin");
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
  tryDeleteProduct,
  RestoreProduct,
  deleteProduct,
  upload,
};