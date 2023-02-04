const mongoose=require("mongoose")
const Schema=mongoose.Schema

const couponSchema=new Schema({
    code:{
        type:String,
        trim : true,
        uppercase : true
    },
    value:{
        type:Number,
        required:true
    },
    minBill:{
        type:Number,
        required:true
    },
    expiryDate:{
        type:Date,
        required:true
    },
    status:{
        type:String,
        required:true
    }
})
const Coupon=mongoose.model('Coupon',couponSchema)
module.exports=Coupon
