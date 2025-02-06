const asyncWrapper = require("../middlewares/async-wrapper");
const User = require("../models/user.model");
const bcryptjs = require("bcryptjs");
const appError = require("../utils/appError");
const httpStatusText = require("../utils/http.status.text");
const generate_JWT_token = require("../utils/generate_JWT_token");

const register = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const err = appError.create(
      "All fields are required",
      400,
      httpStatusText.FAIL
    );
    return next(err);
  }

  const existingPrevUser = await User.findOne({ email: email });
  if (existingPrevUser) {
    const err = appError.create(
      "User already exists",
      400,
      httpStatusText.FAIL
    );
    return next(err);
  }

  //Password Encryption By Hashing
  const hashedPassword = await bcryptjs.hash(password, 10);
  console.log("hashedPassword", hashedPassword);

  const newUser = new User({ email, password: hashedPassword });
  await newUser.save();

  return res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: {
      user: newUser,
    },
  });
});

const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const err = appError.create(
      "All fields are required",
      400,
      httpStatusText.FAIL
    );
    return next(err);
  }

  const user = await User.findOne({ email: email });

  if (!user) {
    const err = appError.create(
      "User does not exist",
      400,
      httpStatusText.FAIL
    );
    return next(err);
  }

  const matchedPassword = await bcryptjs.compare(password, user.password);

  if (user && matchedPassword) {
    const token = await generate_JWT_token({
      email: user.email,
      id: user._id,
      role: user.role,
    });

    return res.status(200).json({
      status: httpStatusText.SUCCESS,

      data: { token },
    });
  } else {
    const err = appError.create(
      "Invalid Credentials",
      400,
      httpStatusText.FAIL
    );
    return next(err);
  }
});

module.exports = {
  register,
  login,
};
