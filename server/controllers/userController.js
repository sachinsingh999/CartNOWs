import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const createToken=(id)=>{
  return jwt.sign({id},process.env.JWT_SECRET)

}

//Route for user Login
const loginUser=async(req,res)=>{
  try {
    const {email,password}=req.body;
    const user=await userModel.findOne({email});
    if(!user){
      return res.status(409).json({
        success: false,
        message: "User doesn't exists",
      });

    }

    const isMatch=await bcrypt.compare(password,user.password);

    if(isMatch){
      const token=createToken(user._id);
      res.json({success:true,token})
    }else{
      res.json({success:false,message:"invalid credentials"})
    }

    
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
    
  }

}

// Route for user registration
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body||{};

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = createToken(user._id);

    res.status(201).json({
      success: true,
      token
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const adminLogin=(async (req, res) => {
  try {
    const {email,password}=req.body;
    if(email===process.env.ADMIN_EMAIL && password===process.env.ADMIN_PASSWORD){
      const token=jwt.sign(email+password,process.env.JWT_SECRET)

      res.json({success:true,token})
    }
    else{
      res.json({
      success: false,
      message: "invalid credentials",
    });

    }
  } catch (error) {
    
    console.log(error);
    res.json({success:false,message:error.message})
    
  }


})



/* ================= GET USER PROFILE ================= */
const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Migrate older users who do not have a key yet
    if (!user.deliveryVerificationKey) {
      user.deliveryVerificationKey = Math.random().toString(36).substring(2, 8).toUpperCase();
      await user.save();
    }

    const userProfile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      deliveryVerificationKey: user.deliveryVerificationKey,
    };

    res.json({
      success: true,
      user: userProfile,
    });
  } catch (error) {
    console.log("PROFILE ERROR 👉", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};






export {loginUser,registerUser,adminLogin,getUserProfile}