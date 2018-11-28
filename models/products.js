var mongoose = require('mongoose');


//page schema
var ProductSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    key: {
        type: String
    },
    desc: {
        type: String,
        required: true
    },
    sorting: {
        type: Number
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String
    }
});

var Product = module.exports = mongoose.model('Product',ProductSchema);