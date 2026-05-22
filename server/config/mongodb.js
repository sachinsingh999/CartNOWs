import mongoose from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/cartNOW`);

    console.log("DB Connected");

  } catch (error) {
    console.log("DB Connection Error:", error.message);
  }
};

export default connectDb;
