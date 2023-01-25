require('dotenv').config()
const mongoose = require('mongoose');
mongoose.set("strictQuery", false);



module.exports={
    
    ServiceID : process.env.TWILIO_SERVICE_SID,
    accountSID : process.env.TWILIO_ACCOUNT_SID,
    authTocken : process.env.TWILIO_AUTH_TOCKEN,

     connectToDb: (cb) => {
        mongoose.connect(process.env.dataBase,{ useNewUrlParser: true })
            .then(() => {
                console.log("connected to DB")
                return cb();
            })
            .catch((err) => {
                console.log(err);
                return cb(err)
            })
    }
}


