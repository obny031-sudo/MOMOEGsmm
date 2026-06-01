const mongoose =
  require("mongoose");

const connectDB =
  async () => {
    try {

      console.log(
        process.env.MONGO_URI
      );

      await mongoose.connect(
        process.env.MONGO_URI,
        {
          serverSelectionTimeoutMS: 10000,
        }
      );

      console.log(
        "Mongo Connected 😈🔥"
      );

    } catch (
      error
    ) {

      console.log(
        "Mongo Error:",
        error
      );

      process.exit(1);
    }
  };

module.exports =
  connectDB;