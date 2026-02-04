import { registerUser, loginUser } from "../services/auth.service.js";

export const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user
    });
  } catch (error) {
    // Handle specific error messages
    if (error.message === "User already exists") {
      return res.status(400).json({
        success: false,
        message: "Email already registered. Please use a different email or try logging in."
      });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    // Handle specific error messages
    if (error.message === "Invalid credentials") {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please try again."
      });
    }
    next(error);
  }
};