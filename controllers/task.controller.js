const httpStatusText = require("../utils/http.status.text");
const asyncWrapper = require("../middlewares/async-wrapper");
const { validationResult } = require("express-validator");
const appError = require("../utils/appError");
const mongoose = require("mongoose");

const Task = require("../models/task.model");

const getAllTasks = asyncWrapper(async (req, res, next) => {
  const query = req.query;
  const search = query.search || "";

  const sort = query.sort || "createdAt"; // Use a valid field
  const sortOrder = query.order || "desc"; // Default to "asc" if not provided
  const order = sortOrder === "asc" ? 1 : -1;

  const limit = parseInt(query.limit) || 10;
  const page = parseInt(query.page) || 1;
  const skip = (page - 1) * limit;
  
  const pipeline = [];

  const userID = new mongoose.Types.ObjectId(req.userID);

  // Filter tasks by user ID

  // Add search stage if search query is provided
  if (search) {
    pipeline.push({
      $search: {
        autocomplete: {
          path: "content", // Replace with the field you want to search
          query: search,
        },
      },
    });
  }

  // Add pagination and sorting
  const tasks = await Task.aggregate([
    ...pipeline,
    { $match: { user: userID } },
  ])
    .sort({ [sort]: order })
    .skip(skip)
    .limit(limit);

  console.log("tasks", tasks);
  console.log("userIdObjectId", userID);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: tasks.length,
    data: tasks,
  });
});

const getTaskByID = asyncWrapper(async (req, res, next) => {
  const taskID = req.params.id;
  console.log("taskID", taskID);
  const userID = req.userID;

  const task = await Task.findOne({ _id: taskID, user: userID });
  if (!task) {
    const err = appError.create("Task not found", 404, httpStatusText.FAIL);
    return next(err);
  }
  res.status(200).json({ status: httpStatusText.SUCCESS, data: { task } });
});

const createTask = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const err = appError.create(errors.array(), 400, httpStatusText.FAIL);

    return next(err);
  }
  const userID = new mongoose.Types.ObjectId(req.userID);

  const newTask = new Task({
    ...req.body,
    user: userID,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  newTask.save();

  return res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { task: newTask },
  });
});

const updateTask = asyncWrapper(async (req, res, next) => {
  const taskID = req.params.id;
  const userID = req.userID;

  const updatedTask = await Task.findOneAndUpdate(
    { _id: taskID, user: userID },
    {
      $set: { ...req.body, updatedAt: Date.now() },
    }
  );

  if (!updatedTask) {
    const err = appError.create("Task not found", 404, httpStatusText.FAIL);
    return next(err);
  }

  return res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { task: updatedTask },
  });
});

const deleteTask = asyncWrapper(async (req, res, next) => {
  const taskID = req.params.id;
  const userID = req.userID;

  await Task.findOneAndDelete({
    _id: taskID,
    user: userID,
  });

  if (!taskID) {
    const err = appError.create("Task not found", 404, httpStatusText.FAIL);
    return next(err);
  }

  return res.status(200).json({ status: httpStatusText.SUCCESS, data: null });
});

module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskByID,
};
