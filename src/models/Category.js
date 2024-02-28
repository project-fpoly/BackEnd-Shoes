import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        imageUrl: {
            type: String,
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
        viewCount: {
            type: Number,
            default: 0,
        },
    },
    { versionKey: false, timestamps: true }
);

categorySchema.plugin(mongoosePaginate);

export default mongoose.model("Category", categorySchema);