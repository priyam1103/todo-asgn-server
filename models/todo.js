const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema(
  {
    todo: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    ofUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Todo = mongoose.model("todo", TodoSchema);
module.exports = Todo;
