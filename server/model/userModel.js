const mongoose=require("mongoose")
const Schema=mongoose.Schema

const UserSchema=new Schema({
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
        },
        mobile:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true
        },
        blockStatus:{
            type:Boolean,
        },
        token:{
            type:Number
        }
},{timestamps:true})

const User=mongoose.model('User',UserSchema);
module.exports=User;