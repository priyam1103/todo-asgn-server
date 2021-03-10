require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());
const Todo = require("./models/todo");
const PORT = process.env.PORT || 3000; 
const Updates = require("./models/updates");

app.use(cors());

mongoose
  .connect("mongodb+srv://priyam1103:priyam7035@cluster0.jyafn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", { useNewUrlParser: true })
  .then(() => {
    console.log("db connected");
  });

app.post("/addtodo", async function (req, res) {
  try {
    const { todo, body } = req.body;
    const body_ = body.replace(/\s\s+/g, " ");
    const body_data = body_.split(" ");
    let data;
    body_data.map((item) => {
      data = data ? data + " " + item.substr(0, 30) : item.substr(0, 30);
    });
    const todo_created = await Todo.create({ todo, body: data });
    await Updates.create({ update: `${todo_created.todo} created.` });
    res.status(200).json({ todo_created });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Please try again" });
  }
});

app.get("/todos", async function (req, res) {
  try {
    const todos = await Todo.find();
    res.status(200).json(todos);
  } catch (err) {
    res.status(400).json({ message: "Please try again" });
  }
});

app.put("/updatetodo/:id", async function (req, res) {
  try {
    const id = req.params.id;

    const todo = await Todo.findOne({ _id: id });
    if (todo) {
      todo.completed = true;
      await todo.save();
      res.status(200).json(todo);
      await Updates.create({ update: `${todo.todo} marked done.` });
    } else {
      res.status(400).json({ message: "Please try again" });
    }
  } catch (err) {
    res.status(400).json({ message: "Please try again" });
  }
});

app.delete("/deletetodo/:id", async function (req, res) {
  try {
    const id = req.params.id;
    const todo = await Todo.findOne({ _id: id });
    await Todo.findOneAndDelete({ _id: id }).then(async () => {
      res.status(200).json({ message: "Done" });
      await Updates.create({ update: `${todo.todo} deleted.` });
    });
  } catch (err) {
    res.status(400).json({ message: "Please try again" });
  }
});
app.get("/getupdates", async function (req, res) {
  try {
    const updates = await Updates.find();
    res.status(200).json(updates);
  } catch (err) {
    res.status(400).json({ message: "Please try again" });
  }
});
app.listen(PORT, () => {
  console.log("Running on port 3000");
});
