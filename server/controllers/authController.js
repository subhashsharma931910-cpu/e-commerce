import ErrorHandler from "../middlewares/errorMiddleware.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import database from "../database/db.js";
import bcrypt from "bcrypt";
import { sendToken } from "../utils/jwtToken.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new ErrorHandler("Please enter all fields", 400));
  }
  const isAlreadyRegistered = await database.query(
    `SELECT * FROM users WHERE email = $1`,
    [email],
  );

  if (isAlreadyRegistered.rows.length > 0) {
    return next(new ErrorHandler("User Already Registered.", 400));
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const user = await database.query(
    `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`,
    [name, email, hashPassword],
  );
  sendToken(user.rows[0], 201, "User Registered Successfully", res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please enter all fields", 400));
  }
  const user = await database.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);
  if (user.rows.length === 0) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }
  const isPasswordMatch = await bcrypt.compare(password, user.rows[0].password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }
  sendToken(user.rows[0], 200, "Logged In.", res);
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const { user } = req;
  res.status(200).json({
    success: true,
    user,
  });
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged Out successfully",
    });
});
