import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Check header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 2️⃣ Extract token
    const token = authHeader.split(" ")[1];

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Attach user (🔥 MUST be _id)
    req.user = {
      _id: decoded._id || decoded.id,
    };

    if (!req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

const authUserOptional = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        _id: decoded._id || decoded.id,
      };
    }
  } catch (error) {
    // Suppress token verification errors for optional auth
  }
  next();
};

export { authUserOptional };
export default authUser;
