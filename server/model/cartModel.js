const mongoose=require("mongoose")
const Schema=mongoose.Schema

const cartSchema=new Schema({
    owner: {
        type: String,
        required: true
    },
        productName: {
            type: String
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },
        price: {
            type: Number
        },
        category: {
            type: String,
            required: true
        },
        img1: {
            type: String,
            required: true
        },
    bill: {
        type: Number,
        default: 0
    },
    totalBill:{
        type:String,
        default:0
    }

})
const Cart=mongoose.model('Cart',cartSchema)
module.exports=Cart;