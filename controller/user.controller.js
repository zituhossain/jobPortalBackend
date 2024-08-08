import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  errorHandler,
  responseHandler,
} from "../middlewares/responseHandler.js";

export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;
    if (!fullname || !email || !phoneNumber || !password || !role) {
      return responseHandler(res, 400, "All fields are required", false);
    }
    const user = await User.findOne({ email });

    if (user) {
      return responseHandler(res, 400, "User already exists", false);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullname,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
    });

    return responseHandler(res, 201, "User created successfully", true);
  } catch (error) {
    return errorHandler(res, error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return responseHandler(res, 400, "All fields are required", false);
    }
    let user = await User.findOne({ email });

    if (!user) {
      return responseHandler(res, 400, "Incorrect email or password", false);
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return responseHandler(res, 400, "Incorrect email or password", false);
    }

    if (role !== user.role) {
      return responseHandler(
        res,
        400,
        "Account does't exist for this role",
        false
      );
    }

    const tokenData = {
      userId: user._id,
    };

    const token = jwt.sign(tokenData, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      })
      .json({
        message: `Welcome back ${user.fullname}`,
        user,
        success: true,
      });
  } catch (error) {
    return errorHandler(res, error);
  }
};

export const logout = async (req, res) => {
  try {
    res.status(200).clearCookie("token").json({
      message: "Logout successful",
      success: true,
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, bio, skills } = req.body;
    const file = req.file;
    let skillsArray;
    if (skills) {
      skillsArray = skills.split(",");
    }
    const userId = req.id;

    let user = await User.findById(userId);
    if (!user) {
      return responseHandler(res, 404, "User not found", false);
    }

    // updating data
    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (skills) user.profile.skills = skillsArray;

    await user.save();

    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return responseHandler(res, 200, "Profile updated successfully", true, {
      user,
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};
