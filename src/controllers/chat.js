import axios from 'axios';
import chatValidationSchema from '../validations/Chat';
import Chat from '../models/Chat';
import User from '../models/User';

const CHAT_ENGINE_PRIVATE_KEY = '0c44367f-c900-47ba-b4cc-76d9472549d1';
const CHAT_ENGINE_PROJECT_ID = 'f2650ca0-3e46-47c5-a198-6e04fa81d3dc';

async function registerChatUser(username, secret, email, first_name, last_name, create_by) {
    // Validate dữ liệu đầu vào
    const { error } = chatValidationSchema.validate({ username, secret, email, first_name, last_name });
    if (error) throw new Error(error.details[0].message);

    try {
        const response = await axios.post(
            'https://api.chatengine.io/users/',
            { username, secret, email, first_name, last_name },
            { headers: { 'Private-Key': CHAT_ENGINE_PRIVATE_KEY } }
        );

        // Lấy ID của người tạo từ bảng User
        const createdByUser = await User.findById(create_by);

        // Lưu thông tin người dùng vào cơ sở dữ liệu
        const newUser = new Chat({ username, secret, email, first_name, last_name, create_by: { _id: createdByUser._id, userName: createdByUser.userName, email : createdByUser.email } });
        await newUser.save();

        return response.data;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message === "This username is taken.") {
            throw new Error("Tên người dùng đã được sử dụng. Vui lòng chọn một tên khác.");
        } else {
            throw new Error("Đã xảy ra lỗi khi đăng ký tài khoản.");
        }
    }
}


async function loginChatUser(username, secret) {
    // Validate dữ liệu đầu vào
    const { error } = chatValidationSchema.validate({ username, secret });
    if (error) throw new Error(error.details[0].message);

    try {
        const response = await axios.get('https://api.chatengine.io/users/me/', {
            headers: {
                'Project-ID': CHAT_ENGINE_PROJECT_ID,
                'User-Name': username,
                'User-Secret': secret,
            },
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message === "Authentication failed.") {
            throw new Error("Thông tin đăng nhập không chính xác. Vui lòng kiểm tra lại tên người dùng và mật khẩu.");
        } else {
            throw new Error("Đã xảy ra lỗi khi đăng nhập.");
        }
    }
}


// Export các hàm để có thể sử dụng ở nơi khác trong mã của bạn
export { registerChatUser, loginChatUser };
