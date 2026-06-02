const mongoose =
  require("mongoose");

const userSchema =
  new mongoose.Schema({

    /* Identity */

    username:{
      type:String,
      required:true,
      trim:true,
      unique:true,
      minlength:3,
      maxlength:30,
    },

    email:{
      type:String,
      required:true,
      trim:true,
      unique:true,
      lowercase:true,
    },

    password:{
      type:String,
      required:true,
      minlength:6,
      select:false,
    },

    phone:{
      type:String,
      default:"",
    },

    avatar:{
      type:String,
      default:"",
    },

    provider:{
      type:String,
      enum:[
        "local",
        "google",
        "telegram",
      ],
      default:"local",
    },

    /* Role */

    role:{
      type:String,
      enum:[
        "user",
        "vip",
        "moderator",
        "staff",
        "reseller",
        "admin",
      ],
      default:"user",
    },

    favoriteServices:{
      type:[Number],
      default:[],
    },

    lastCheckIn:{
      type:Date,
      default:null,
    },

    vipTier:{
      type:Number,
      default:0,
    },

    /* Wallet */

    balance:{
      type:Number,
      default:0,
      min:0,
    },

    bonus:{
      type:Number,
      default:0,
      min:0,
    },

    coupons:{
      type:Number,
      default:0,
      min:0,
    },

    spent:{
      type:Number,
      default:0,
      min:0,
    },

    walletFrozen:{
      type:Boolean,
      default:false,
    },

    walletLimit:{
      type:Number,
      default:10000,
    },

    /* Verification */

    verified:{
      type:Boolean,
      default:false,
    },

    emailVerifyToken:{
      type:String,
      default:"",
      select:false,
    },

    kycStatus:{
      type:String,
      enum:[
        "none",
        "pending",
        "approved",
        "rejected",
      ],
      default:"none",
    },

    /* Account */

    status:{
      type:String,
      enum:[
        "active",
        "suspended",
        "banned",
      ],
      default:"active",
    },

    /* Security */

    lastLogin:{
      type:Date,
      default:null,
    },

    lastIP:{
      type:String,
      default:"",
    },

    devices:[
      {
        device:String,
        ip:String,
        date:{
          type:Date,
          default:Date.now,
        },
      },
    ],

    loginHistory:[
      {
        ip:String,
        device:String,
        date:{
          type:Date,
          default:Date.now,
        },
      },
    ],

    loginAttempts:{
      type:Number,
      default:0,
    },

    lockUntil:{
      type:Date,
      default:null,
    },

    twoFactorEnabled:{
      type:Boolean,
      default:false,
    },

    resetPasswordToken:{
      type:String,
      default:"",
      select:false,
    },

    resetPasswordExpire:{
      type:Date,
      default:null,
      select:false,
    },

    riskScore:{
      type:Number,
      default:0,
    },

    /* Orders */

    ordersCount:{
      type:Number,
      default:0,
    },

    completedOrders:{
      type:Number,
      default:0,
    },

    pendingOrders:{
      type:Number,
      default:0,
    },

    /* Referral */

    referralCode:{
      type:String,
      default:"",
    },

    referredBy:{
      type:String,
      default:"",
    },

    referralEarnings:{
      type:Number,
      default:0,
    },

    /* Preferences */

    preferences:{
      language:{
        type:String,
        default:"en",
      },
      theme:{
        type:String,
        default:"dark",
      },
    },

    /* Notifications */

    notifications:{
      email:{
        type:Boolean,
        default:true,
      },
      system:{
        type:Boolean,
        default:true,
      },
      marketing:{
        type:Boolean,
        default:false,
      },
    },

    /* Admin */

    adminNote:{
      type:String,
      default:"",
    },

    /* Social */

    social:{
      telegram:{
        type:String,
        default:"",
      },
      instagram:{
        type:String,
        default:"",
      },
    },

  },{
    timestamps:true,
  });

/* Indexes — email/username already indexed via unique:true */

userSchema.index({
  referralCode: 1,
});

module.exports =
  mongoose.model(
    "User",
    userSchema
  );