exports.getDashboard =
  async (
    req,
    res
  )=>{

    try{

      const user =
        req.user;

      res.status(200)
      .json({

        success:true,

        dashboard:{

          username:
            user?.username ||

            "Elite User",

          email:
            user?.email ||

            "elite@momoeg.com",

          balance:4320,

          spent:1772,

          pending:230,

          bonus:80,

          health:99,

          notifications:3,

          verified:true,

          stats:{

            orders:4992724,

            growth:12,

            completed:95,

            active:18,

          },

          ticker:[

            "System Stable",
            "Payments Running",
            "Platform Online",
            "Security Verified",
            "API Healthy",

          ],

          alerts:[

            {

              title:
                "Security Verified",

              type:
                "success",

            },

            {

              title:
                "Wallet Bonus Added",

              type:
                "reward",

            },

          ],

          profile:{

            rank:
              "Elite",

            joined:
              "2025",

            status:
              "Premium",

          },

          orderFeed:[

            "Instagram Followers • Completed",

            "TikTok Likes • Running",

            "Telegram Members • Delivered",

            "YouTube Views • Processing",

          ],

          depositFeed:[

            "+$50 Deposit",

            "+$120 Added",

            "+$30 Wallet Topup",

          ],

          processingFeed:[

            "Queued",

            "Running",

            "Delivered",

            "Protected",

          ],

        }

      });

    }catch(
      error
    ){

      res.status(500)
      .json({

        success:false,

        message:
          "Dashboard error"

      });

    }

  };