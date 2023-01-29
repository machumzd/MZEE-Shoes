const mongoose=require("mongoose")
const Schema=mongoose.Schema

const cartSchema=new Schema({
    owner: {
        type: String,
        required: true
    },
    product:{
        type:String,
        required:true
    },
    
    quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        }

})
const Cart=mongoose.model('Cart',cartSchema)
module.exports=Cart;