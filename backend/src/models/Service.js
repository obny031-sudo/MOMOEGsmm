const mongoose =
  require("mongoose");

const serviceSchema =
  new mongoose.Schema(

    {

      serviceId:{
        type:Number,
        required:true,
        unique:true,
      },

      category:{
        type:String,
        required:true,
      },

      title:{
        type:String,
        required:true,
      },

      price:{
        type:Number,
        required:true,
      },

      min:{
        type:Number,
        required:true,
      },

      max:{
        type:Number,
        required:true,
      },

      speed:{
        type:String,
        default:"Fast",
      },

      featured:{
        type:Boolean,
        default:false,
      },

      active:{
        type:Boolean,
        default:true,
      },

    },

    {
      timestamps:true
    }

  );

module.exports =
  mongoose.model(
    "Service",
    serviceSchema
  );