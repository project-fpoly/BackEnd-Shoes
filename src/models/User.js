import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate-v2";
const userSchema = new mongoose.Schema({
    userName: {
      type: String,
      required: true,
    },
    email: {
        type: String, 
        required: true
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpiry: Date,
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "member",
    },
    avt: {
      type: String,
    },
    deliveryAddress: {
      type: String,
    },
    gender: {
      type: String,
    },
    dateOfBirth: {
      type: String,
    },
    phoneNumbers: {
        type: String
    },
    lastActivity: {
        type: Date,
        default: null,
    },
}, { versionKey: false, timestamps: true})

//Tạm thời check bằng lần cuối người dùng làm 1 tác vụ
userSchema.pre('save', function (next) {
    this.lastActivity = new Date();
    next();
});
userSchema.plugin(mongoosePaginate);
export default mongoose.model('User', userSchema)