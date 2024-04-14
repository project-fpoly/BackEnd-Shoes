import Product from "../models/Product.js";
import productValidator from "../validations/product.js";
import Category from "../models/Category.js";
import { isValid } from "date-fns";
import Notification from "../models/Notification.js";
import { createNotificationForAdmin } from "./notification.js";
import Sale from "../models/Sale.js";
import Bill from "../models/Bill.js";
import { Cart, CartItem } from "../models/Cart.js";
const addProduct = async (req, res) => {
  try {
    const {
      product_id, SKU, name, description, categoryId, price, sale, discount, quantity, sold_count, rating,
      sizes, color, material, release_date, images, video, blog, warranty, tech_specs, stock_status, gender, isPublished, publishedDate, hits,
    } = req.body;

    // Kiểm tra dữ liệu đầu vào sử dụng validator
    const validationResult = productValidator.validate(req.body, {
      abortEarly: false,
    });

    if (validationResult.error) {
      return res.status(400).json({
        status: "error",
        message: "Dữ liệu không hợp lệ",
        error: validationResult.error.details[0].message,
      });
    }

    // Kiểm tra sản phẩm trùng lặp
    const existingProduct = await Product.findOne({ product_id });
    const existingProductByName = await Product.findOne({ name });
    if (existingProduct || existingProductByName) {
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
    // sendNotificationToAllClients("Sản phẩm mới đã được thêm vào.");
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
    const { page, pageSize, searchKeyword, categoryFilter, sizeFilter, priceFilter, materialFilter, releaseDateFilter, colorFilter, genderFilter, deleteFilter, sortOrder, filterOutOfStock } = req.query;

    const options = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(pageSize, 10) || 10,
    };

    const searchCondition = buildSearchCondition(searchKeyword, categoryFilter, sizeFilter, priceFilter, materialFilter, releaseDateFilter, colorFilter, genderFilter, deleteFilter, filterOutOfStock);
    const sortOptions = buildSortOptions(sortOrder);

    const { products, total } = await getProductsWithPagination(searchCondition, options);
    const totalPages = Math.ceil(total / options.limit);

    // Kiểm tra và ẩn những kích thước có quantity = 0 trong mỗi sản phẩm
    products.forEach(product => {
      product.sizes = product.sizes.filter(size => size.quantity > 0);
    });

    if (products.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm nào",
        data: [],
      });
    }
    const productIds = products.map((product) => product._id);
    let populatedProducts = {};
    populatedProducts = await Product.find({ _id: { $in: productIds } }).populate("categoryId", "name").populate("sale", "name discount description expiration_date").sort(sortOptions);
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
    if (filterOutOfStock) {
      successMessage += " Bạn đã chọn sản phẩm hết hàng là: " + filterOutOfStock + ";";
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
      case "asc_createdAt":
        sortOptions.createdAt = 1;
        sortOrderMessage = "Ngày tạo tăng dần";
        break;
      case "desc_createdAt":
        sortOptions.createdAt = -1;
        sortOrderMessage = "Ngày tạo giảm dần";
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
      data: result.products,

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
  materialFilter, releaseDateFilter, colorFilter, genderFilter, deleteFilter, categoryNameFilter, stockStatusFilter, filterOutOfStock) => {
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
    if (minPrice !== "" && maxPrice !== "") {
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        if (minPrice === maxPrice) {
          searchCondition.price = { $eq: parseInt(minPrice) };
        } else {
          searchCondition.price = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
        }
      } else {
        throw new Error("Giá trị minPrice hoặc maxPrice không hợp lệ");
      }
    } else if (minPrice !== "") {
      if (!isNaN(minPrice)) {
        searchCondition.price = { $gte: parseInt(minPrice) };
      } else {
        throw new Error("Giá trị minPrice không hợp lệ");
      }
    } else if (maxPrice !== "") {
      if (!isNaN(maxPrice)) {
        searchCondition.price = { $lte: parseInt(maxPrice) };
      } else {
        throw new Error("Giá trị maxPrice không hợp lệ");
      }
    } else {
      priceFilter = ""
    }
  }

  if (materialFilter) {
    searchCondition.material = materialFilter;
  }

  if (releaseDateFilter) {
    const [startDate, endDate] = releaseDateFilter.split("->");

    if (startDate && endDate) {
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);

      if (isValid(parsedStartDate) && isValid(parsedEndDate)) {
        const searchCondition = {};

        if (parsedStartDate.getTime() !== parsedEndDate.getTime()) {
          searchCondition.release_date = {
            $gte: parsedStartDate,
            $lte: parsedEndDate
          };
        } else {
          searchCondition.release_date = { $eq: parsedStartDate };
        }

        // Sử dụng searchCondition ở đây cho mục đích tiếp theo trong việc tìm kiếm
      } else {
        throw new Error("Giá trị startDate hoặc endDate không hợp lệ");
      }
    } else {
      throw new Error("Thiếu giá trị startDate hoặc endDate trong releaseDateFilter");
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
  if (filterOutOfStock) {
    searchCondition.quantity = 0;
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
  } else if (sortOrder === "asc_createdAt") {
    sortOptions.createdAt = 1;
  } else if (sortOrder === "desc_createdAt") {
    sortOptions.createdAt = -1;
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

export const fetchMaterial = async (req, res) => {
  try {
    const products = await Product.find()
    const materials = products.map((product) => product.material);
    return res.status(200).json({
      message: "Lấy được danh sách chất liệu của sản phẩm thành công",
      data: Array.from(new Set(materials)),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Lỗi hệ thống"
    });
  }
};
export const fetchColor = async (req, res) => {
  try {
    const products = await Product.find()
    const colors = products.map((product) => product.color);
    return res.status(200).json({
      message: "Lấy được danh sách chất liệu của sản phẩm thành công",
      data: Array.from(new Set(colors)),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Lỗi hệ thống"
    });
  }
};
export const fetchTechSpec = async (req, res) => {
  try {
    const products = await Product.find()
    const tech_specs = products.map((product) => product.tech_specs);
    return res.status(200).json({
      message: "Lấy được danh sách tech_specs của sản phẩm thành công",
      data: Array.from(new Set(tech_specs)),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Lỗi hệ thống"
    });
  }
};

export const fetchSize = async (req, res) => {
  try {
    const products = await Product.find()
    const allSizes = [];
    products.forEach(product => {
      product.sizes.forEach(size => {
        if (!allSizes.includes(size.name)) {
          allSizes.push(size.name);
        }
      });
    });
    return res.status(200).json({
      message: "Lấy được danh sách size của sản phẩm thành công",
      data: allSizes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Lỗi hệ thống"
    });
  }
};

// GetDetail
const getDetailProduct = async (req, res) => {
  try {
    // Tìm sản phẩm theo ID và tăng giá trị của trường hits lên 1, hoặc tạo mới nếu chưa tồn tại
    let product = await Product.findOneAndUpdate(
      { _id: req.params.id },
      { $inc: { hits: 1 } },
      {
        new: true, // Trả về bản ghi đã được cập nhật
        upsert: true // Tạo mới bản ghi nếu không tìm thấy
      }
    ).populate("categoryId", "name").populate("sale", "name discount description quantity expiration_date ");

    if (!product) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm"
      });
    }
    product.sizes = product.sizes.filter(size => size.quantity > 0);

    if (product.sale) {
      const saleInfo = await Sale.findById(product.sale);
      if (saleInfo) {
        const saleObject = {
          _id: saleInfo._id,
          name: saleInfo.name,
          discount: saleInfo.discount
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
    const productId = req.params.id;
    const updateData = req.body;
    // Loại bỏ trường "_id" khỏi các đối tượng size
    if (updateData.sizes && Array.isArray(updateData.sizes)) {
      updateData.sizes = updateData.sizes.map(size => {
        const { _id, ...rest } = size;
        return rest;
      });
    }


    // Kiểm tra dữ liệu đầu vào sử dụng validator
    const validationResult = productValidator.validate(updateData, {
      abortEarly: false,
    });

    if (validationResult.error) {
      return res.status(400).json({
        status: "error",
        message: "Dữ liệu không hợp lệ",
        error: validationResult.error.details.map(detail => detail.message),
      });
    }

    // Kiểm tra tồn tại của sản phẩm
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Kiểm tra sản phẩm trùng lặp
    const existingProductById = await Product.findOne({ product_id: updateData.product_id });
    const existingProductByName = await Product.findOne({ name: updateData.name });
    if ((existingProductById && existingProductById._id.toString() !== productId) ||
      (existingProductByName && existingProductByName._id.toString() !== productId)) {
      return res.status(409).json({
        status: "error",
        message: "Sản phẩm đã tồn tại",
      });
    }

    const product = await Product.findByIdAndUpdate(productId, { $set: updateData }, { new: true });
    if (!product) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm"
      });
    }
    //Kiểm tra có trùng size hay không
    const sizesMap = new Map();
    updateData.sizes.forEach(size => {
      const name = size.name;
      const quantity = size.quantity;
      if (sizesMap.has(name)) {
        sizesMap.set(name, sizesMap.get(name) + quantity);
      } else {
        sizesMap.set(name, quantity);
      }
    });

    const newSizes = [];
    sizesMap.forEach((quantity, name) => {
      newSizes.push({ name, quantity });
    });
    newSizes.sort((a, b) => parseInt(a.name) - parseInt(b.name));
    updateData.sizes = newSizes;

    // Cập nhật thông tin sản phẩm
    await Product.findByIdAndUpdate(productId, { $set: updateData });

    await Category.updateMany({ products: productId }, { $pull: { products: productId } });
    await Category.findByIdAndUpdate(updateData.categoryId, { $addToSet: { products: productId } });
    await Sale.updateMany({ product: productId }, { $pull: { product: productId } });
    await Sale.findByIdAndUpdate(updateData.sale, { $addToSet: { product: productId } });

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


const updateField = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm"
      });
    }

    const { fieldName, value } = req.body;

    // Kiểm tra fieldName hợp lệ
    if (!product[fieldName]) {
      return res.status(400).json({
        message: "Trường dữ liệu không hợp lệ"
      });
    }

    // Validate giá trị value nếu cần thiết
    // ...

    // Cập nhật trường dữ liệu cụ thể trong sản phẩm
    product[fieldName] = value;

    // Lưu lại sản phẩm đã cập nhật
    const updatedProduct = await product.save();

    return res.status(200).json({
      message: "Cập nhật trường sản phẩm thành công!",
      data: updatedProduct
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

    // Kiểm tra và thêm trường 'isDeleted' nếu chưa tồn tại
    if (!product.hasOwnProperty("isDeleted")) {
      product.isDeleted = true;
    } else {
      // Nếu trường 'isDeleted' đã tồn tại và có giá trị, cập nhật nó thành true
      product.isDeleted = true;
    }

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
      message: "Đã khôi phục sản phẩm!",
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

    // Kiểm tra xem sản phẩm có trong bất kỳ hóa đơn nào không
    const billsWithProduct = await Bill.find({ 'cartItems.product': req.params.id });
    if (billsWithProduct.length > 0) {
      return res.status(400).json({
        message: "Không thể xóa sản phẩm vì đã được sử dụng trong các đơn hàng"
      });
    }

    // Kiểm tra xem sản phẩm có trong bất kỳ giỏ hàng nào không
    const carts = await Cart.find({ "cartItems.product": req.params.id });
    if (carts.length > 0) {
      return res.status(400).json({
        message: "Không thể xóa sản phẩm vì đang có trong giỏ hàng của người dùng"
      });
    }

    // Nếu không có giỏ hàng hoặc hóa đơn nào chứa sản phẩm, tiếp tục với việc xóa sản phẩm
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

const incrementHit = async (req, res) => {
  try {
    const productId = req.params.id;
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        status: "error",
        message: "Sản phẩm không tồn tại",
      });
    }
    if (!existingProduct.hits) {
      await Product.updateOne({ _id: productId }, { $set: { hits: 0 } });
    }
    await Product.updateOne({ _id: productId }, { $inc: { hits: 1 } });

    res.status(200).json({
      status: "success",
      message: "Đã tăng lượt xem thành công!",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Lỗi máy chủ",
      error: error.message,
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
  updateField,
  incrementHit,

};