require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const auth = require("./middleware/auth");
const authAdmin = require("./middleware/authAdmin");
const app = express();
app.use(express.json());
const User = require("./models/user");
const Todo = require("./models/todo");
const PORT = process.env.PORT || 3005;

app.use(cors());

mongoose
  .connect("mongodb://127.0.0.1/todo-app-assgn", {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("db connected");
  });

app.post("/signup", async function (req, res) {
  try {
    const { emailId, password, role } = req.body;

    const user = await User.findOne({
      $or: [{ emailId: emailId }],
    });
    if (user)
      res.status(401).json({
        type: "emailId",
        message: "Email id already exists.",
      });
    else {
      let hashedpass = await bcrypt.hash(password, 10);

      const user_ = new User({
        emailId: emailId,
        password: hashedpass,
        role: role,
      });
      await user_.save();
      const token = await user_.generateAuthToken();
      res
        .status(200)
        .json({ token: token, user_, message: "Sign Up Successfull" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Please try again later" });
  }
});

app.post("/signin", async function (req, res) {
  try {
    const { emailId, password } = req.body;
    const user_ = await User.findOne({ emailId: emailId.trim() });
    if (user_) {
      let valid = await bcrypt.compare(password, user_.password);
      if (valid) {
        const token = await user_.generateAuthToken();
        res.status(200).json({ token, user_, message: "User logged in" });
      } else {
        res.status(401).json({ type: "password", message: "Invalid password" });
      }
    } else {
      res
        .status(401)
        .json({ type: "emailId", message: "Email Id does not exists" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Please try again later" });
  }
});

app.post("/addtodo", auth, async function (req, res) {
  try {
    const { todo, body } = req.body;
    const user_id = res.locals._id;
    const user = await User.findOne({ _id: user_id });
    const body_ = body.replace(/\s\s+/g, " ");
    const body_data = body_.split(" ");
    let data;
    body_data.map((item) => {
      data = data ? data + " " + item.substr(0, 30) : item.substr(0, 30);
    });
    const todo_created = await Todo.create({
      todo,
      body: data,
      ofUser: user_id,
    });
    user.todos.push(todo_created._id);
    user.save();
    res.status(200).json({ todo_created });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Please try again" });
  }
});

app.get("/todos", auth, async function (req, res) {
  try {
    const user_id = res.locals._id;
    const user = await User.findOne({ _id: user_id });
    var todos = [];
    if (user.role != "admin") {
      if (user.todos.length == 0) {
        return res.status(200).json(todos);
      }
      await user.todos.map(async (item, index) => {
        todos.push(await Todo.findById(item));
        if (index == user.todos.length - 1) {
          res.status(200).json(todos);
        }
      });
    } else {
      res.status(200).json(await Todo.find().populate("user"));
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Please try again" });
  }
});

app.put("/updatetodo/:id", auth, async function (req, res) {
  try {
    const id = req.params.id;
    const todo = await Todo.findOne({ _id: id });
    if (todo) {
      todo.completed = true;
      await todo.save();
      res.status(200).json(todo);
    } else {
      res.status(400).json({ message: "Please try again" });
    }
  } catch (err) {
    res.status(400).json({ message: "Please try again" });
  }
});

app.delete("/deletetodo/:id", auth, async function (req, res) {
  try {
    const id = req.params.id;
    const todo = await Todo.findOne({ _id: id });
    const user = await User.findOne({ _id: todo.ofUser });
    console.log(user.todos);
    await user.todos.splice(user.todos.indexOf(id), 1);
    await user.save();
    console.log(user.todos);
    await Todo.findOneAndDelete({ _id: id }).then(async () => {
      res.status(200).json({ message: "Done" });
    });
  } catch (err) {
    res.status(400).json({ message: "Please try again" });
  }
});

app.get("/alltodos", authAdmin, async function (req, res) {
  try {
    var todos = await Todo.find();
    res.status(200).json(todos);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Please try again" });
  }
});

app.listen(PORT, () => {
  console.log("Running on port " + PORT);
});
