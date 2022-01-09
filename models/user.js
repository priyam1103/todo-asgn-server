const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const UserSchema = new mongoose.Schema(
  {
    password: {
      type: String,
      required: true,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
    },
    todos: {
      type: Array,
      default: [],
    },
    role: {
      type: String,
      required: true,
      default: "Standard",
    },
  },
  { timestamps: true }
);

UserSchema.method("generateAuthToken", async function () {
  const user = this;
  const token = jwt.sign({ id: user._id, emailId: user.emailId }, "qwertyabdc");
  return token;
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
