import express from "express";
import dotenv from "dotenv";
import router from "./routes/index.js";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
const app = express();

dotenv.config();
const { PORT, DB_URI, SECRET_CODE } = process.env;

app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use(express.json());
app.use(
  session({
    secret: SECRET_CODE, // Thay thế bằng một chuỗi bí mật mạnh hơn trong môi trường thực tế
    resave: false,
    saveUninitialized: true,
  })
);
mongoose.connect(DB_URI).then(() => {
  console.log("Connected!");
});
app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
