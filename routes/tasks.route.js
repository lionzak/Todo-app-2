const express = require("express");
const router = express.Router();
const app = express();
const taskController = require("../controllers/task.controller");
// const verifyToken = require("../middlewares/verifyToken");
// const allowedTo = require("../middlewares/allowedTo");
const {validationSchema} = require("../middlewares/validation-schema");

app.use(express.json());

router.route("/").get(taskController.getAllTasks).post(validationSchema, taskController.createTask);

router.route("/:id").patch(taskController.updateTask).delete(taskController.deleteTask).get(taskController.getTaskByID);


module.exports = router;