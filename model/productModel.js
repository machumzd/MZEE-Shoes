const mongoose=require('mongoose')
const { stringify } = require('querystring')
const Schema=mongoose.Schema

const productSchema=new Schema({
    productName:{
        type:String,
        required:true
    },
    price:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
    img1:{
        type:String,
        required:true
    },
    img2:{
        type:String,
        required:true
    },
    category:{
        type:String,

    },bgColor:{
        type:String
    },Trending:{
        type:Boolean
    },offer:{
        type:String
    },isDeleted:{
        type:Boolean
    }

},{timestamps:true})
const Product=mongoose.model('Product',productSchema)

module.exports=Product;