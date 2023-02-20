const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const wishlistSchema = new Schema({
  owner: {
    type: String,
    required: true,
  },
  items: [{
    productName:{type:String},
    price:{type:String},
    img1:{type:String},
    stock:{type:Number},
    category:{type:String},
    Trending:{type:Boolean},
    offer:{type:String},
    bgColor:{type:String},
    __v:{type:Number},
  }]
});
const Wishlist=mongoose.model("Wishlist",wishlistSchema)
module.exports=Wishlist