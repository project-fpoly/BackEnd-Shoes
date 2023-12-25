import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "member"
    }
    ,
    avt: {
        type: String
    }
<<<<<<< HEAD
}, { versionKey: false, timestamps: true})
=======
    ,
    deliveryAddress: {
        type: Array
    }
    ,
    gender: {
        type: String
    }
    ,
    dateOfBirth: {
        type: String
    }
    ,
    phoneNumbers: {
        type: Array
    }
}, { versionKey: false, timestamps: true })
>>>>>>> da9b94690d6446b27254ff3856f25d7000424232

export default mongoose.model('User', userSchema)