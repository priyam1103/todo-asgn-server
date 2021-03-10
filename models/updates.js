const mongoose = require("mongoose");

const UpdatesSchema = new mongoose.Schema(
  {
    update: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Updates = mongoose.model("Updates", UpdatesSchema);
module.exports = Updates;
