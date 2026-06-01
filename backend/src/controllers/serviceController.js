const Service =
  require(
    "../models/Service"
  );

/* GET */

exports.getServices =
  async (
    req,
    res
  )=>{

    try{

      const services =
        await Service.find({

          active:true

        }).sort({

          category:1

        });

      res.status(200)
      .json({

        success:true,

        count:
          services.length,

        services,

      });

    }catch(
      error
    ){

      res.status(500)
      .json({

        success:false,

        message:
          "Server error",

      });

    }

  };