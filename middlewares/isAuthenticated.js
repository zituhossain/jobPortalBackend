import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
  try {
    // const token = req.cookies?.token;
    const token = req.headers?.authorization?.split(" ")[1];
    if (!token || token === "null") {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    if (!decode) {
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }
    req.id = decode.userId;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
    });
  }
};
