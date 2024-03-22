import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const saleSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    discout: {
      type: Number,
      default: true,
    },
    product: {
      type: Array,
      default: true,
    },
    description: {
      type: String,
      required: true,
    },
    create_by: {
      type: Object,
      required: false,
    },
    start_date: {
      type: Date,
      required: true,
    },
    expiration_date: {
      type: Date,
      required: true,
    },
    isDelete: {
      type: Boolean,
      required: false,
      default: "false",
    },
  },
  { timestamps: true }
);

saleSchema.plugin(mongoosePaginate);

export default mongoose.model("Sales", saleSchema);
