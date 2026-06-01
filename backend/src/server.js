require("dotenv").config();

const express =
  require("express");

const cors =
  require("cors");

const helmet =
  require("helmet");

const compression =
  require("compression");

const morgan =
  require("morgan");

const crypto =
  require("crypto");

const rateLimit =
  require(
    "express-rate-limit"
  );

const connectDB =
  require(
    "./config/db"
  );

const authRoutes =
  require(
    "./routes/authRoutes"
  );

const serviceRoutes =
  require(
    "./routes/serviceRoutes"
  );

const app =
  express();

const PORT =
  process.env.PORT ||
  5000;

/* ENV */

const requiredEnv = [

  "MONGO_URI",
  "JWT_SECRET"

];
const dashboardRoutes =
  require(
    "./routes/dashboardRoutes"
  );
  app.use(

  "/api/v1/dashboard",

  dashboardRoutes

);

requiredEnv.forEach(

  (key)=>{

    if(

      !process.env[
        key
      ]

    ){

      console.log(
        `Missing ${key}`
      );

      process.exit(
        1
      );
    }

  }

);

/* Database */

connectDB();

/* Proxy */

app.set(
  "trust proxy",
  1
);

/* Security */

app.use(

  helmet({

    crossOriginResourcePolicy:false

  })

);

app.use(

  cors({

    origin:true,
    credentials:true

  })

);

app.use(
  compression()
);

/* Request ID */

app.use(
  (
    req,
    res,
    next
  )=>{

    req.requestId =
      crypto
        .randomUUID();

    next();

  }
);

/* Global Limit */

const globalLimiter =
  rateLimit({

    windowMs:
      15 *
      60 *
      1000,

    max:250,

    standardHeaders:true,

    legacyHeaders:false,

    message:{

      success:false,

      message:
        "Too many requests"

    }

  });

app.use(
  globalLimiter
);

/* Auth Limit */

const authLimiter =
  rateLimit({

    windowMs:
      15 *
      60 *
      1000,

    max:20,

    message:{

      success:false,

      message:
        "Too many auth attempts"

    }

  });

/* Parsers */

app.use(

  express.json({

    limit:"10mb"

  })

);

app.use(

  express.urlencoded({

    extended:true

  })

);

/* Logger */

app.use(
  morgan(
    "dev"
  )
);

/* Root */

app.get(
  "/",
  (
    req,
    res
  )=>{

    res.json({

      success:true,
      app:"MOMOEG API",
      version:"v1",
      status:"online",
      requestId:
        req.requestId

    });

  }
);

/* Health */

app.get(
  "/api/v1/health",
  (
    req,
    res
  )=>{

    res.json({

      success:true,
      server:"healthy",
      uptime:
        process.uptime(),
      memory:
        process.memoryUsage().rss

    });

  }
);

/* Ready */

app.get(
  "/api/v1/ready",
  (
    req,
    res
  )=>{

    res.json({

      success:true,
      ready:true

    });

  }
);

/* Routes */

app.use(
  "/api/v1/auth",
  authLimiter,
  authRoutes
);

app.use(
  "/api/v1/services",
  serviceRoutes
);

/* 404 */

app.use(
  (
    req,
    res
  )=>{

    res
      .status(404)
      .json({

        success:false,
        requestId:
          req.requestId,
        message:
          "Route not found"

      });

  }
);

/* Error */

app.use(
  (
    err,
    req,
    res,
    next
  )=>{

    console.log(
      err.stack
    );

    res
      .status(
        err.status ||
        500
      )
      .json({

        success:false,
        requestId:
          req.requestId,
        message:
          err.message ||
          "Server Error"

      });

  }
);

/* Server */

const server =
  app.listen(

    PORT,

    ()=>{

      console.log(
        "🚀 MOMOEG Backend Online"
      );

      console.log(
        `🔥 Port ${PORT}`
      );

      console.log(
        "🛡 Elite Security Active"
      );

      console.log(
        "📦 Services API Ready"
      );

    }

  );

/* Shutdown */

process.on(
  "SIGINT",
  ()=>{

    console.log(
      "Closing server..."
    );

    server.close(
      ()=>{

        process.exit(
          0
        );

      }
    );

  }
);

/* Crash */

process.on(
  "unhandledRejection",
  (
    err
  )=>{

    console.log(
      "Unhandled:",
      err.message
    );

  }
);

process.on(
  "uncaughtException",
  (
    err
  )=>{

    console.log(
      "Crash:",
      err.message
    );

  }
);