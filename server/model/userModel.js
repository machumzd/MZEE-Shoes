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
        address:[{
            name:{type:String},
            mobile:{type:String},
            address1:{type:String},
            address2:{type:String},
            city:{type:String},
            state:{type:String},
            zip:{type:Number}
        }],
        token:{
            type:Number
        }
},{timestamps:true})

const User=mongoose.model('User',UserSchema);
module.exports=User;