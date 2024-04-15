import { Router } from "express";
import { registerChatUser, loginChatUser } from "../controllers/chat";
import User from '../models/User';
import { checkPermissionMember } from "../middlewares/checkPermission";
const routerChat = Router();
routerChat.post("/signup", checkPermissionMember, async (req, res) => {
    const { username, secret, email, first_name, last_name } = req.body;
    const { _id } = req.user;
    try {
        const result = await registerChatUser(username, secret, email, first_name, last_name, _id);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route để đăng nhập tài khoản chat
routerChat.post("/login",checkPermissionMember, async (req, res) => {
    const { username, secret } = req.body;
    try {
        const result = await loginChatUser(username, secret);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default routerChat;
