import mongoose from "mongoose";

// Mongoose performance profiler plugin
mongoose.plugin((schema) => {
  const logTime = (op, startTime, modelName) => {
    const duration = Date.now() - startTime;
    if (duration > 50) {
      console.log(`\x1b[33m[SLOW QUERY ALERT]\x1b[0m ${modelName}.${op} took \x1b[31m${duration}ms\x1b[0m`);
    } else {
      console.log(`[Mongoose Query] ${modelName}.${op} took ${duration}ms`);
    }
  };

  schema.pre(['find', 'findOne', 'count', 'countDocuments', 'estimatedDocumentCount', 'findOneAndUpdate', 'updateOne', 'deleteOne', 'deleteMany'], function() {
    this._startTime = Date.now();
  });

  schema.post(['find', 'findOne', 'count', 'countDocuments', 'estimatedDocumentCount', 'findOneAndUpdate', 'updateOne', 'deleteOne', 'deleteMany'], function() {
    if (this._startTime) {
      logTime(this.op, this._startTime, this.model.modelName);
    }
  });

  schema.pre('aggregate', function() {
    this._startTime = Date.now();
  });

  schema.post('aggregate', function() {
    if (this._startTime) {
      const modelName = this._model ? this._model.modelName : 'Aggregate';
      logTime('aggregate', this._startTime, modelName);
    }
  });
});

const connectDb = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/cartNOW`);

    console.log("DB Connected");

  } catch (error) {
    console.log("DB Connection Error:", error.message);
  }
};

export default connectDb;
