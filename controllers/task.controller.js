const httpStatusText = require("../utils/http.status.text");
const asyncWrapper = require("../middlewares/async-wrapper");
const { validationResult } = require("express-validator");
const appError = require("../utils/appError");

const Task = require("../models/task.model");

const getAllTasks = asyncWrapper(async (req, res, next) => {
  const query = req.query;

  const search = query.search || "";

  const sort = query.sort || "createdAt";
  const order = query.order || "desc";

  const limit = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * limit;
  console.log("query", query);

  let searchPipeline = [];

  if(search){
    searchPipeline = [
      {
        $search: {
          
          index: "search-text",
          text: {
            query: search,
            path: {
              wildcard: "*"
            }
          }
        }
      }
    ]
  }

  const tasks = await Task.aggregate(searchPipeline, { __v: 0 }).limit(limit).skip(skip).sort({ [sort]: order });
  res.status(200).json({ status: httpStatusText.SUCCESS, data: { tasks } });
});

const getTaskByID = asyncWrapper(async (req, res, next) => {
  const taskID = req.params.id;
  const task = await Task.findById(taskID);
  if (!task) {
    const err = appError.create("Task not found", 404, httpStatusText.FAIL);
    return next(err);
  }
  res.status(200).json({ status: httpStatusText.SUCCESS, data: { task } });
});

const createTask = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // const error = new Error();
    // error.statusCode = 400;
    // error.message = "Validation failed";

    const err = appError.create(errors.array(), 400, httpStatusText.FAIL);

    return next(err);
    // return res.status(400).json({
    //   status: httpStatusText.FAIL,
    //   data: errors.array(),
    // });
  }

  const newCourse = new Task(req.body);
  newCourse.save();

  return res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { task: newCourse },
  });
});

const updateTask = asyncWrapper(async (req, res, next) => {
  const taskID = req.params.id;
  const updatedTask = await Task.findByIdAndUpdate(taskID, {
    $set: { ...req.body, updatedAt: Date.now() },
    
  });


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
  await Task.deleteOne({ _id: taskID });

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
