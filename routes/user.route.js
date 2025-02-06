const express = require("express");
const router = express.Router();
const app = express();
const user = require("../controllers/user.controller");


app.use(express.json());

router.route("/register").post(user.register);
router.route("/login").post(user.login);

module.exports = router;