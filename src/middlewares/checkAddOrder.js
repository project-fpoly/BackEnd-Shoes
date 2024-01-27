import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const { SECRET_CODE } = process.env;

export function checkCreateOder(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, SECRET_CODE, (err, decodedToken) => {
      if (err) {
        return res.status(403).json({ error: "Invalid token" });
      }
      req.user = decodedToken;
      next();
    });
  } else {
    req.user = null;
    next();
  }
}
