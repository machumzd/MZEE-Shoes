const { timeStamp } = require("console")
const mongoose=require("mongoose")
const Schema=mongoose.Schema

const adminSchema=new Schema({
    userEmail:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
},{timeStamps:true})

const Admin=mongoose.model('Admin',adminSchema)

module.exports=Admin;