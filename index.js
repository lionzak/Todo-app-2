const express = require("express");
const cors = require("cors");
const taskRouter = require("./routes/tasks.route");
const mongoose = require("mongoose");
const httpStatusText = require("./utils/http.status.text");
const userRouter = require("./routes/user.route");

require("dotenv").config();

const url = process.env.MONGO_URL;
const port = process.env.PORT;

console.log("Connecting to MongoDB...");
async function main() {
  await mongoose.connect(url).then(() => {
    console.log("Connected to MongoDB");
  });
}

main();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/tasks", taskRouter);
app.use("/api/users", userRouter);

app.all("*", (req, res, next) => {
  return res.status(404).json({
    status: httpStatusText.ERROR,
    message: "This Resource is not available",
  });
});

app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    status: err.statusText || httpStatusText.ERROR,
    message: err.message,
    code: err.statusCode || 500,
    data: null,
  });
});

app.listen(port, () => {
  console.log("Example app listening on port 3000!");
});
