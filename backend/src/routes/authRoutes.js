const express =
  require(
    "express"
  );

const router =
  express.Router();

const {

  register,
  login,
  me,
  forgotPassword,
  resetPassword,
  logout

}
=
require(
  "../controllers/authController"
);

const {

  protect,
  authorize

}
=
require(
  "../middleware/auth"
);

/* Public */

router.post(
  "/register",
  register
);

router.post(
  "/login",
  login
);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password/:token",
  resetPassword
);

router.post(
  "/logout",
  logout
);

/* Protected */

router.get(
  "/me",
  protect,
  me
);

/* Admin */

router.get(
  "/admin",
  protect,
  authorize(
    "admin"
  ),
  (
    req,
    res
  )=>{

    res
      .status(200)
      .json({

        success:true,

        message:
          "Admin access granted",

        admin:
          req.user.username

      });

  }
);

module.exports =
  router;