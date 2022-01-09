const User = require("../models/user");
const jwt = require("jsonwebtoken");

module.exports = async function (req, res, next) {
  try {
    if (!req.headers.authorization) {
      res.status(401).json({ message: "Please login to continue" });
    }
    const token = await req.headers.authorization.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Please login to continue" });
    }
    const decoded = await jwt.verify(token, "qwertyabdc");
    const user = await User.findOne({ _id: decoded.id });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid session, Please login again" });
    }
    if (user.role != "admin") {
      return res
        .status(401)
        .json({ message: "Only admin can view this page." });
    }
    res.locals = user;
    next();
  } catch (err) {
    res.status(400).json({ message: "Please try again later" });
  }
};
