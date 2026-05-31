import jwt from "jsonwebtoken";

const deliverymanAuth = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.json({ success: false, message: "Unauthorized. Please login again." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id || decoded.role !== "deliveryman") {
      return res.json({ success: false, message: "Unauthorized role access." });
    }
    req.deliveryman = {
      id: decoded.id,
    };
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Session expired. Please login again." });
  }
};

export default deliverymanAuth;
