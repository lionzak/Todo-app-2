const express = require("express");
const router = express.Router();
const app = express();
const verifyToken = require("../middlewares/verify_token");
const taskController = require("../controllers/task.controller");
const {validationSchema} = require("../middlewares/validation-schema");

app.use(express.json());

router.route("/").get(verifyToken,taskController.getAllTasks).post(verifyToken,validationSchema, taskController.createTask);

router.route("/:id").patch(verifyToken,taskController.updateTask).delete(verifyToken,taskController.deleteTask).get(verifyToken,taskController.getTaskByID);


module.exports = router;