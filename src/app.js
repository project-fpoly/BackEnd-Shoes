import express from "express";
import http from "http"; // Import the 'http' module
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import router from "./routes/index.js";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import { createNotificationForAdmin } from "./controllers/notification.js";
import User from "./models/User.js";
dotenv.config();
const { PORT, DB_URI, SECRET_CODE } = process.env;

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({
    secret: SECRET_CODE,
    resave: false,
    saveUninitialized: true,
  })
);
mongoose.connect(DB_URI).then(() => {
  console.log("Connected!");
});

app.use("/api", router);

// Socket.io implementation
io.on("connection", (socket) => {
  socket.on("new_user_login",async  (data) => {
    console.log("User connect");
    io.emit("new_user_login", { message: data.message, _id: data._id });
     await User.findByIdAndUpdate(data._id, { isActive: true });
     io.emit("update_user_status", { _id: data._id, isActive: true });
  });
  socket.on("newNotification", (data) => {
    io.emit("newNotification", { message: data.message });
  });
  socket.on("log_out", async (data) => {
    console.log("User logout");
    await User.findByIdAndUpdate(data.userId, { isActive: false });
    io.emit("update_user_status", { _id: data._id, isActive: false });
  });
  socket.on("disconnect", async (data) => {
    console.log("User disconnected",data);
    console.log(socket);
    await User.findByIdAndUpdate(socket.userId, { isActive: false });
    io.emit("update_user_status", { _id: socket._id, isActive: false });
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
