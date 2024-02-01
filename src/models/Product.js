import mongoose from "mongoose";
import timestampPlugin from "mongoose-timestamp";
import mongoosePaginate from 'mongoose-paginate-v2';

const { Schema } = mongoose;

const SizeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return value >= 0;
      },
      message: "Số lượng phải lớn hơn hoặc bằng 0",
    },
  },
});

const ProductSchema = new Schema({
  product_id: {
    type: String,
    required: true,
    unique: true,
  },
  SKU: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: false,
  },
  price: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return value >= 0;
      },
      message: "Giá phải lớn hơn hoặc bằng 0",
    },
  },
  sale: {
    type: Number,
    required: true,
    default: 0,
    validate: {
      validator: function (value) {
        return value >= 0;
      },
      message: "Giá sale phải lớn hơn hoặc bằng 0",
    },
  },
  discount: {
    type: Number,
    required: false,
  },
  quantity: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return value >= 0;
      },
      message: "Số lượng phải lớn hơn hoặc bằng 0",
    },
  },
  sold_count: {
    type: Number,
    required: false,
    default: 0,
  },
  rating: {
    type: Number,
    required: false,
  },
  sizes: [SizeSchema],
  color: {
    type: String,
    required: false,
    enum: ["red", "green", "blue", "yellow", "black", "white"],
  },
  material: {
    type: String,
    required: false,
  },
  release_date: {
    type: Date,
    required: false,
  },
  images: [
    {
      type: String,
      required: false,
    },
  ],
  video: {
    type: String,
    required: false,
  },
  blog: {
    type: Schema.Types.ObjectId,
    ref: "Blog",
    required: false,
  },
  warranty: {
    type: String,
    required: false,
  },
  tech_specs: {
    type: String,
    required: false,
  },
  stock_status: {
    type: String,
    required: false,
  },
  isPublished: {
    type: Boolean,
    required: true,
    default: false,
  },
  publishedDate: {
    type: Date,
    required: false,
  },
  hits: {
    type: Number,
    required: false,
    default: 0,
  },
});

ProductSchema.plugin(timestampPlugin);
ProductSchema.index({ product_id: 1, name: "text" });
ProductSchema.index({ categoryId: 1 });
ProductSchema.plugin(mongoosePaginate);

const Product = mongoose.model("Product", ProductSchema);

export default Product;