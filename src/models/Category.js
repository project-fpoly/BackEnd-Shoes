import mongoose from "mongoose"
import mongoosepaginate from "mongoose-paginate-v2";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
}, { versionKey: false, timestamps: true })

categorySchema.plugin(mongoosepaginate)

export default mongoose.model('Category', categorySchema)