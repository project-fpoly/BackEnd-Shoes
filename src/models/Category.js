import mongoose from "mongoose"

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
}, { versionKey: false, timestamps: true })

export default mongoose.model('Category', categorySchema)