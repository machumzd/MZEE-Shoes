const mongoose = require('mongoose');
const Schema=mongoose.Schema

const orderSchema = new Schema({
    owner : {
      type: String,
      
    },
    address : {
        name : { type : String },
        mobile : { type : Number },
        address1 : { type : String},
        address2 : { type : String},
        city : { type : String },
        state : { type : String },
        zip : { type : Number } 

    },
    items:[
      { 
        productId:{type:String},
        productName:{type:String},
        price:{type:Number},
        category:{type:String},
        img1:{type:String},
        bill:{type:Number},
        quantity:{type:Number},
        orderStatus:{type:String}}
    ] 
    ,
    paymentMode : {
        type : String
    },
    orderBill : {
        type : String
    },orderDate : {
        type : Date,
        default: Date()
    }
   
}, {timestamps: true})


const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

