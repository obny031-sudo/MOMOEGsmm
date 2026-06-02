const bcrypt =
  require("bcryptjs");

const jwt =
  require("jsonwebtoken");

const crypto =
  require("crypto");

const User =
  require("../models/User");

const { formatUser } =
  require("../utils/userResponse");

const { seedWelcomeNotifications } =
  require("./userDataController");

const { getDefaultNewUserBalance } =
  require("../services/settingsService");

const { recordTransaction } =
  require("../utils/walletLedger");

/* Token Helper */

const sendToken =
(
  user,
  statusCode,
  res
)=>{

  const token =
    jwt.sign(

      {
        id:user._id
      },

      process.env.JWT_SECRET,

      {
        expiresIn:"30d"
      }

    );

  res
    .status(
      statusCode
    )
    .json({

      success:true,

      token,

      user:{

        id:user._id,
        username:user.username,
        email:user.email,
        role:user.role,
        balance:user.balance,
        verified:user.verified,

      }

    });

};

/* Register */

exports.register =
  async (
    req,
    res
  )=>{

    try{

      const {
        username,
        email,
        password,
        phone
      } = req.body;

      const normalizedUsername =
        String(username || "").trim();

      const normalizedEmail =
        String(email || "").trim().toLowerCase();

      if(

        !normalizedUsername ||
        !normalizedEmail ||
        !password

      ){

        return res
          .status(400)
          .json({

            success:false,

            message:
              "All fields required"

          });
      }

      if(
        normalizedUsername.length < 3
      ){

        return res
          .status(400)
          .json({

            success:false,

            message:
              "Username must be at least 3 characters"

          });
      }

      const exists =
        await User.findOne({

          $or:[
            {
              email: normalizedEmail
            },
            {
              username: normalizedUsername
            }
          ]

        });

      if(
        exists
      ){

        return res
          .status(400)
          .json({

            success:false,

            message:
              "User already exists"

          });
      }

      const salt =
        await bcrypt.genSalt(
          10
        );

      const hashed =
        await bcrypt.hash(

          password,

          salt

        );

      const referralCode =
        Math.random()
          .toString(36)
          .substring(2,8)
          .toUpperCase();

      const startingBalance =
        await getDefaultNewUserBalance();

      const user =
        await User.create({

          username: normalizedUsername,
          email: normalizedEmail,
          password:
            hashed,
          phone: phone || "",
          referralCode,
          balance: startingBalance,

        });

      if (startingBalance > 0) {
        await recordTransaction({
          userId: user._id,
          type: "bonus",
          amount: startingBalance,
          balanceBefore: 0,
          balanceAfter: startingBalance,
          description: "Welcome balance",
          referenceId: "registration",
        });
      }

      await seedWelcomeNotifications(user._id);

      sendToken(
        user,
        201,
        res
      );

    }catch(
      error
    ){

      console.log(
        "Register error:",
        error.message
      );

      if(
        error.code === 11000
      ){

        return res
          .status(400)
          .json({

            success:false,

            message:
              "User already exists"

          });
      }

      if(
        error.name === "ValidationError"
      ){

        const messages =
          Object.values(error.errors)
            .map((e) => e.message)
            .join(", ");

        return res
          .status(400)
          .json({

            success:false,

            message: messages || "Validation failed"

          });
      }

      res
        .status(500)
        .json({

          success:false,

          message:
            "Server error"

        });
    }

  };

/* Login */

exports.login =
  async (
    req,
    res
  )=>{

    try{

      const {
        email,
        password
      } = req.body;

      if(
        !email ||
        !password
      ){

        return res
          .status(400)
          .json({

            success:false,

            message:
              "Missing credentials"

          });
      }

      const user =
        await User
          .findOne({
            email
          })
          .select(
            "+password"
          );

      if(
        !user
      ){

        return res
          .status(400)
          .json({

            success:false,

            message:
              "Invalid credentials"

          });
      }

      /* banned */

      if(

        user.status===
        "banned"

      ){

        return res
          .status(403)
          .json({

            success:false,

            message:
              "Account banned"

          });
      }

      /* lock */

      if(

        user.lockUntil &&

        user.lockUntil >
        Date.now()

      ){

        return res
          .status(423)
          .json({

            success:false,

            message:
              "Account temporarily locked"

          });
      }

      /* compare */

      const match =
        await bcrypt.compare(

          password,

          user.password

        );

      if(
        !match
      ){

        user.loginAttempts++;

        if(

          user.loginAttempts>=5

        ){

          user.lockUntil =
            Date.now() +
            15*
            60*
            1000;
        }

        await user.save();

        return res
          .status(400)
          .json({

            success:false,

            message:
              "Invalid credentials"

          });
      }

      /* success */

      user.loginAttempts=0;

      user.lockUntil=
        null;

      user.lastLogin=
        new Date();

      user.lastIP=
        req.ip;

      user.loginHistory
        .push({

          ip:req.ip,

          device:
            req.headers[
              "user-agent"
            ]

        });

      await user.save();

      sendToken(
        user,
        200,
        res
      );

    }catch(
      error
    ){

      console.log(
        error
      );

      res
        .status(500)
        .json({

          success:false,

          message:
            "Server error"

        });
    }

  };

/* Me */

exports.me =
  async (
    req,
    res
  )=>{

    res
      .status(200)
      .json({

        success:true,

        user: formatUser(req.user)

      });

  };

/* Forgot Password */

exports.forgotPassword =
  async (
    req,
    res
  )=>{

    const user =
      await User.findOne({

        email:
          req.body.email

      });

    if(
      !user
    ){

      return res
        .status(404)
        .json({

          success:false,

          message:
            "User not found"

        });
    }

    const resetToken =
      crypto
        .randomBytes(20)
        .toString("hex");

    user.resetPasswordToken =
      resetToken;

    user.resetPasswordExpire =
      Date.now() +
      15*
      60*
      1000;

    await user.save();

    res.json({

      success:true,

      message:
        "Reset token created",

      token:
        resetToken

    });

  };

/* Reset Password */

exports.resetPassword =
  async (
    req,
    res
  )=>{

    const user =
      await User
        .findOne({

          resetPasswordToken:
            req.params.token

        })
        .select(
          "+password +resetPasswordToken"
        );

    if(

      !user ||

      user.resetPasswordExpire <
      Date.now()

    ){

      return res
        .status(400)
        .json({

          success:false,

          message:
            "Invalid token"

        });
    }

    const salt =
      await bcrypt.genSalt(
        10
      );

    user.password =
      await bcrypt.hash(

        req.body.password,

        salt

      );

    user.resetPasswordToken =
      "";

    user.resetPasswordExpire =
      null;

    await user.save();

    sendToken(
      user,
      200,
      res
    );

  };

/* Logout */

exports.logout =
(
  req,
  res
)=>{

  res
    .status(200)
    .json({

      success:true,

      message:
        "Logged out"

    });

};