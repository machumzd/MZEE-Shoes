const mongoose=require("mongoose")
const Schema=mongoose.Schema

const addressSchema=new Schema({
    owner:{
        type:String
    },
        name:{
            type:String
        },
        mobile:{
            type:String
        },
        address1:{
            type:String
        },
        address2:{
            type:String
        },
        city:{
            type:String
        },
        state:{
            type:String
        },
        zip:{
            type:String
        }
})
const Address=mongoose.model('Address',addressSchema)
module.exports=Address;