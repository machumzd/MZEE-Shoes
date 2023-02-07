const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bannerSchema = new Schema({
  title: {
     type: String,
     required: true 
    },
  subTitle: {
     type: String,
      required: true 
    },
  description: {
     type: String, 
     required: true
     },
  image: { 
    type: String 
},
status:{
    type:String
},
  redirect: { 
    type: String
 },
});
const Banner=mongoose.model('Banner',bannerSchema)
module.exports=Banner

