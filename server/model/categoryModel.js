const mongoose = require('mongoose');

const Schema = mongoose.Schema

const categorySchema = new Schema({
    category : {
        type : String,
        trim : true,
        uppercase : true
        
    }
})
const Category = mongoose.model('category', categorySchema);

module.exports = Category;
